import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import supabase from "@/utils/supabase-browser";

export default function RequireHost({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkHost() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase.rpc("is_host");
      setAllowed(!!data);
      setLoading(false);
    }

    checkHost();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!allowed) return <Navigate to="/host" replace />;

  return children;
}
