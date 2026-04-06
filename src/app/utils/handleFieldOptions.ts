// /app/utils/handleFieldOptions.ts

interface OptionConfig {
  key: string; // field name (like "Campaign", "City", etc.)
  fetchFn?: () => Promise<any>; // async API function to fetch data
  staticData?: any[]; // for hardcoded arrays like ['Admin', 'Agent1']
  mapFn?: (item: any) => any; // optional transformation function
}

export const handleFieldOptions = async (
  configs: OptionConfig[],
  setFieldOptions: React.Dispatch<React.SetStateAction<Record<string, any[]>>>
) => {
  try {
    // Fetch all data concurrently for better performance
    const results = await Promise.all(
      configs.map(async (config) => {
        try {
          let data: any[] = [];

          // 1️⃣ Fetch dynamic data
          if (config.fetchFn) {
            const res = await config.fetchFn();


            if (res.admins) {
              console.log(" naruto is : ",res.admins)
              data = (res.admins || [])
                .filter((item: any) => item?.role === "user")
                .filter((item: any) => item?.status === "active")
                .map(config.mapFn || ((item: any) => item?.name))
                .filter(Boolean);
            }
            else {
              data = (res || [])
                .filter((item: any) => item?.Status === "Active")
                .map(config.mapFn || ((item: any) => item?.Name))
                .filter(Boolean);
            }

          }
          

          // 2️⃣ Handle static data
          if (config.staticData) {
            data = config.staticData;
          }

          return { key: config.key, data };
        } catch (err) {
          console.error(`Error fetching ${config.key}:`, err);
          return { key: config.key, data: [] };
        }
      })
    );

    // 3️⃣ Build final object structure
    const merged: Record<string, any[]> = {};
    for (const { key, data } of results) {
      merged[key] = data;
    }

    // 4️⃣ Update state (merging with existing options)
    setFieldOptions((prev) => ({ ...prev, ...merged }));
  } catch (error) {
    console.error("Error in handleFieldOptions:", error);
  }
};
