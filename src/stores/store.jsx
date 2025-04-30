import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useStore = create(
	persist(
		(set, get) => ({
			userAccessToken: "",
		}),
		{
			storage: createJSONStorage(() => sessionStorage),
		}
	)
);

export default useStore;
