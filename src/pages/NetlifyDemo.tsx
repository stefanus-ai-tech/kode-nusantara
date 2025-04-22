
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NETLIFY_FUNCTION_URL = "/.netlify/functions/hello"; // Example netlify function endpoint

const NetlifyDemo = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callFunction = async () => {
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch(NETLIFY_FUNCTION_URL);
      const data = await resp.text();
      setResult(data);
    } catch (e: any) {
      setResult("Error: " + String(e));
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 rounded-lg shadow-md bg-white max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Netlify Function Demo</h2>
        <p className="mb-4 text-gray-600">
          This box calls a sample Netlify function at <code>{NETLIFY_FUNCTION_URL}</code>.
        </p>
        <Button onClick={callFunction} disabled={loading}>
          {loading ? "Memanggil..." : "Panggil Function"}
        </Button>
        {result && (
          <div className="mt-4 p-3 rounded bg-gray-50 border text-gray-700">
            <pre>{result}</pre>
          </div>
        )}
      </div>
    </main>
  );
};

export default NetlifyDemo;
