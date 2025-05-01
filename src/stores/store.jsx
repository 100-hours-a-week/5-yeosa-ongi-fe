import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useUserStore = create(
	persist(
		(set, get) => ({
			userAccessToken: "",
			user: "",
			setUserData: (data) => set(data),
			getUser: () => get().user,
		}),
		{
			storage: createJSONStorage(() => sessionStorage),
		}
	)
);

export default useUserStore;
