import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useUserStore = create(
	persist(
		(set, get) => ({
			userAccessToken: "",
			user: "",
			setUserData: (token, user) =>
				set({ userAccessToken: token, user: user }),
			getUser: () => get().user,
		}),
		{
			storage: createJSONStorage(() => sessionStorage),
		}
	)
);

export default useUserStore;
