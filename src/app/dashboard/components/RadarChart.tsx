"use client";

import { useState, useEffect, useRef } from "react";
import { useDashboardData } from "../data/useDashboardSectionOne";
import { getCustomer, getFilteredCustomer } from "@/store/customer";

// Types
interface User {
  id: number;
  name: string;
  customers: number;
}

interface UserData {
  users: User[];
}

// Custom ChevronDown icon
const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// Mock data structure - replace with your actual backend data
/* const mockUserData: UserData = {
  users: [
    { id: 1, name: "John Doe", speed: 185 },
    { id: 2, name: "Jane Smith", speed: 75 },
    { id: 3, name: "Mike Johnson", speed: 240 },
    { id: 4, name: "Sarah Williams", speed: 140 },
    { id: 5, name: "Tom Brown", speed: 295 },
  ],
}; */

export default function RadarChart() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [animatedSpeed, setAnimatedSpeed] = useState(0);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, value: 0 });
  const [dropdownDirection, setDropdownDirection] = useState<'bottom' | 'top'>('bottom');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const { userCustomers, setUserCustomers } = useDashboardData();
  const [selectedUser, setSelectedUser] = useState(userCustomers.users[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const [customerCount, setCustomerCount] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById("chart-container");
      if (container) {
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // Use the available container space for responsive sizing
        const width = Math.min(containerWidth, 800);
        const height = Math.min(containerHeight * 0.9, width * 0.75); // Use container height as base
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Use ResizeObserver for better container size detection
    const container = document.getElementById("chart-container");
    if (container) {
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(container);
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", updateDimensions);
      };
    }

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate dropdown position based on available space
  const calculateDropdownPosition = () => {
    if (!dropdownButtonRef.current) return 'bottom';

    const buttonRect = dropdownButtonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // Approximate dropdown height (5 items * ~48px each)
    const estimatedDropdownHeight = 240;

    // If not enough space below but enough space above, open upwards
    if (spaceBelow < estimatedDropdownHeight && spaceAbove >= estimatedDropdownHeight) {
      return 'top';
    }

    return 'bottom';
  };

  const handleDropdownToggle = () => {
    if (!isDropdownOpen) {
      // When opening dropdown, calculate the best position
      const direction = calculateDropdownPosition();
      setDropdownDirection(direction);
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        dropdownButtonRef.current &&
        !dropdownButtonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Animate needle when user changes
  useEffect(() => {
    setAnimatedSpeed(0);
    const targetSpeed = selectedUser?.customers || 0;
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = targetSpeed / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedSpeed(targetSpeed);
        clearInterval(timer);
      } else {
        setAnimatedSpeed(Math.round(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [selectedUser]);

  const getZoneColor = (speed: number): string => {
    if (speed <= 90) return "#22c55e"; // green
    if (speed <= 210) return "#9ca3af"; // gray
    return "#ef4444"; // red
  };

  const getZoneLabel = (speed: number): string => {
    if (speed <= 90) return "Safe";
    if (speed <= 210) return "Normal";
    return "High";
  };

  const calculateNeedleAngle = (speed: number): number => {
    // Convert speed (0-300) to angle (-135 to 135 degrees)
    // 0 speed = -135°, 150 speed = 0° (top), 300 speed = 135°
    const normalizedSpeed = Math.min(Math.max(speed, 0), 300);
    return -135 + (normalizedSpeed / 300) * 270;
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ): { x: number; y: number } => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const createArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    innerRadius: number
  ): string => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
    const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y} Z`;
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {

    const svg = event.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    setTooltip({
      show: true,
      x: svgP.x,
      y: svgP.y,
      value: animatedSpeed
    });
  };

  const handleMouseLeave = () => {
    console.log("Mouse left SVG"); // Add this
    setTooltip({ show: false, x: 0, y: 0, value: 0 });
    setHoveredZone(null);
  };

  const handleZoneHover = (zone: string) => {
    setHoveredZone(zone);
  };

  const handleZoneLeave = () => {
    setHoveredZone(null);
  };

  const centerX = dimensions.width / 2;
  const centerY = (dimensions.height - 80) / 2 + 20;
  const outerRadius = Math.min(centerX, centerY) * 0.8;
  const innerRadius = outerRadius * 0.6;
  const needleLength = outerRadius * 0.85;
  const needleAngle = calculateNeedleAngle(animatedSpeed);


  const getUsers = async () => {
    const response = await getCustomer();
    setCustomerCount(response.length);
    const users = response.filter((item: any) => {
  return Array.isArray(item.AssignTo) && item.AssignTo.length > 0;
});
    console.log("users are ", users);
    return users
  }

  const RedarChartDataFetch = async () => {
    try {
      const allCustomers = await getUsers(); // all customers with AssignTo

      if (!allCustomers || allCustomers.length === 0) {
        console.log("No customers found");
        setUserCustomers({ users: [] });
        return;
      }

      // Step 1: Create a map of unique users
      const userMap: Record<string, { id: string; name: string; customers: number }> = {};

   allCustomers.forEach((customer: any) => {
  const assignedUsers = customer.AssignTo || [];

  assignedUsers.forEach((user: any) => {
    const userId = user.id || user._id;
    const userName = user.name;

    if (!userId || !userName) return;

    if (!userMap[userId]) {
      userMap[userId] = { id: userId, name: userName, customers: 0 };
    }

    userMap[userId].customers += 1;
  });
});

      // Step 2: Convert map to array
      /*   const result = Object.values(userMap); */
      const customerLength = await getCustomer();
      const totalCustomers = customerLength.length;

      const result = Object.values(userMap).map(user => ({
        ...user,
        percentage: totalCustomers > 0
          ? Math.round((user.customers / totalCustomers) * 100)
          : 0
      }));

      setUserCustomers({ users: result });
      setSelectedUser(result[0] || null);

      console.log("Final Users With Filtered Customer Count:", result);
    } catch (error) {
      console.error("Error fetching radar chart data:", error);
    }
  };




  useEffect(() => {
    RedarChartDataFetch();
  }, [])


  return (
    <div className="flex flex-col w-full h-auto min-h-[350px]">
      <div className="w-full h-full bg-white shadow-lg p-4  sm:p-6 flex flex-col min-h-0">
        <div id="chart-container" className="w-full h-full flex flex-col min-h-0 flex-1">
          <div className="flex-1 py-0 pt-6 min-h-0">
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              className="overflow-visible"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Green zone (0-90) - Bottom Left */}
              <path
                d={createArc(
                  centerX,
                  centerY,
                  outerRadius,
                  -135,
                  -45,
                  innerRadius
                )}
                fill="#22c55e"
                opacity={hoveredZone === 'green' ? "1" : "0.9"}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => handleZoneHover('green')}
                onMouseLeave={handleZoneLeave}
              />

              {/* Gray zone (90-210) - Top */}
              <path
                d={createArc(centerX, centerY, outerRadius, -45, 45, innerRadius)}
                fill="#9ca3af"
                opacity={hoveredZone === 'gray' ? "1" : "0.9"}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => handleZoneHover('gray')}
                onMouseLeave={handleZoneLeave}
              />

              {/* Red zone (210-300) - Bottom Right */}
              <path
                d={createArc(centerX, centerY, outerRadius, 45, 135, innerRadius)}
                fill="#ef4444"
                opacity={hoveredZone === 'red' ? "1" : "0.9"}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => handleZoneHover('red')}
                onMouseLeave={handleZoneLeave}
              />

              {/* Scale markers and labels */}
              {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => {
                const angle = -135 + (value / 300) * 810;
                const tickRadius = outerRadius + 15;
                const point = polarToCartesian(
                  centerX,
                  centerY,
                  tickRadius,
                  angle
                );
                const labelPoint = polarToCartesian(
                  centerX,
                  centerY,
                  tickRadius + 20,
                  angle
                );

                return (
                  <g key={value}>
                    <line
                      x1={centerX}
                      y1={centerY}
                      x2={point.x}
                      y2={point.y}
                      stroke="#d1d5db"
                      strokeWidth="1"
                    />
                    <text
                      x={labelPoint.x}
                      y={labelPoint.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs sm:text-sm font-medium fill-gray-700"
                    >
                      {value}%
                    </text>
                  </g>
                );
              })}

              {/* Needle */}
              <g>
                <defs>
                  <filter
                    id="shadow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {(() => {
                  const needleEnd = polarToCartesian(
                    centerX,
                    centerY,
                    needleLength,
                    needleAngle
                  );
                  const needleBase1 = polarToCartesian(
                    centerX,
                    centerY,
                    8,
                    needleAngle + 90
                  );
                  const needleBase2 = polarToCartesian(
                    centerX,
                    centerY,
                    8,
                    needleAngle - 90
                  );

                  return (
                    <>
                      {Number.isFinite(needleEnd.x) && Number.isFinite(needleEnd.y) &&
                        Number.isFinite(needleBase1.x) && Number.isFinite(needleBase1.y) &&
                        Number.isFinite(needleBase2.x) && Number.isFinite(needleBase2.y) && (
                          <polygon
                            points={`${needleEnd.x},${needleEnd.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
                            fill="#3b82f6"
                            filter="url(#shadow)"
                          />
                        )}

                      <circle
                        cx={centerX}
                        cy={centerY}
                        r="12"
                        fill="#1e40af"
                        filter="url(#shadow)"
                      />
                    </>
                  );
                })()}
              </g>

              {/* Current speed value */}
              {Number.isFinite(animatedSpeed) && (
                <text
                  x={centerX}
                  y={centerY + outerRadius + 30}
                  textAnchor="middle"
                  className="text-xl sm:text-2xl font-bold"
                  fill={getZoneColor(animatedSpeed)}
                >
                  {animatedSpeed}
                </text>
              )}


              {/* Tooltip */}
              {tooltip.show && (
                <g>
                  <rect
                    x={tooltip.x - 60}
                    y={tooltip.y - 45}
                    width="120"
                    height="40"
                    rx="8"
                    fill="rgba(0, 0, 0, 0.8)"
                  />
                  <text
                    x={tooltip.x}
                    y={tooltip.y - 30}
                    textAnchor="middle"
                    className="text-sm font-medium fill-white"
                  >
                    Assigned: {animatedSpeed}
                  </text>
                  <text
                    x={tooltip.x}
                    y={tooltip.y - 10}
                    textAnchor="middle"
                    className="text-sm font-medium fill-white"
                  >
                    Total: {customerCount}
                  </text>
                  <polygon
                    points={`${tooltip.x - 10},${tooltip.y - 5} ${tooltip.x + 10},${tooltip.y - 5} ${tooltip.x},${tooltip.y + 10}`}
                    fill="rgba(0, 0, 0, 0.8)"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* User selector dropdown with smart positioning */}
          {(userCustomers.users.length > 0) && <div className="mt-4 sm:mt-6 flex justify-center shrink-0">
            <div className="relative w-full max-w-[200px]" ref={dropdownRef}>
              <button
                ref={dropdownButtonRef}
                onClick={handleDropdownToggle}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between"
              >
                <span className="font-medium text-xs sm:text-sm text-gray-700 truncate">
                  {selectedUser?.name}
                </span>
                <ChevronDown
                  className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {(isDropdownOpen) && (
                <div
                  className={`absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto ${dropdownDirection === 'top'
                    ? 'bottom-full mb-1'  // Opens above the button
                    : 'top-full mt-1'     // Opens below the button (default)
                    }`}
                >

                  {userCustomers.users.map((user, index) => {

                    return <button
                      key={index}
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-blue-50 transition-colors text-xs sm:text-sm ${selectedUser?.id === user?.id
                        ? "bg-blue-100 text-blue-700 font-semibold"
                        : "text-gray-700"
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate">{user?.name}</span>
                        <span className={`text-xs sm:text-sm font-medium ml-2 ${user?.customers <= 90
                          ? 'text-green-600'
                          : user.customers <= 210
                            ? 'text-gray-600'
                            : 'text-red-600'
                          }`}>
                          {user?.customers}
                        </span>
                      </div>
                    </button>
                  })}
                </div>
              )}
            </div>
          </div>
          }
        </div>
      </div>
    </div>
  );
}