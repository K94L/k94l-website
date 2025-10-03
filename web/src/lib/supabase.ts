import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/env/server";

const options = {
  auth: {
    persistSession: false,
  },
};

let serviceClient: SupabaseClient | undefined;
let anonClient: SupabaseClient | undefined;

export const getServiceSupabaseClient = () => {
  if (!serviceClient) {
    serviceClient = createClient(
      serverEnv.SUPABASE_URL,
      serverEnv.SUPABASE_SERVICE_ROLE_KEY,
      options,
    );
  }
  return serviceClient;
};

export const getAnonSupabaseClient = () => {
  if (!anonClient) {
    anonClient = createClient(
      serverEnv.SUPABASE_URL,
      serverEnv.SUPABASE_ANON_KEY,
      options,
    );
  }
  return anonClient;
};
