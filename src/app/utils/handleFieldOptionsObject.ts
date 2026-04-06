// /app/utils/handleFieldOptionsObject.ts
interface OptionConfig {
  key: string; // e.g. "Campaign"
  fetchFn?: () => Promise<any>; // async API function
  staticData?: any[];
  mapFn?: (item: any) => any; // optional transformation
}

export const handleFieldOptionsObject = async (
  configs: OptionConfig[],
  setFieldOptions: React.Dispatch<React.SetStateAction<Record<string, any[]>>>
) => {
  try {
    const results = await Promise.all(
      configs.map(async (config) => {
        try {
          let data: any[] = [];

          // 1️⃣ Fetch dynamic data
          if (config.fetchFn) {
            const res = await config.fetchFn();

            if (res.admins) {
              // Admins type
              data = (res.admins || [])
                .filter((item: any) => item?.role === "user" || item?.role === "city_admin")
                .filter((item: any) => item?.status === "active")
                .map(config.mapFn || ((item: any) => item)) // ✅ keep object
                .filter(Boolean);
            } else {
              // Normal campaigns or other data
              data = (res || [])
                .filter((item: any) => item?.Status === "Active")
                .map(config.mapFn || ((item: any) => item)) // ✅ keep object
                .filter(Boolean);
            }
          }

          // 2️⃣ Handle static data (if provided)
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

    // 3️⃣ Merge results
    const merged: Record<string, any[]> = {};
    for (const { key, data } of results) {
      merged[key] = data;
    }

    // 4️⃣ Update state
    setFieldOptions((prev) => ({ ...prev, ...merged }));
  } catch (error) {
    console.error("Error in handleFieldOptionsObject:", error);
  }
};
