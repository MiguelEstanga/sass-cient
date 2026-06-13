import { api } from "@/lib/api/client";

export const pinService = {
  
  verify: (pin: string) =>
    api.post<null>("pin/verify", { pin }),

  
  change: (currentPin: string, newPin: string) =>
    api.post<null>("pin/change", {
      current_pin: currentPin,
      new_pin:     newPin,
    }),
};