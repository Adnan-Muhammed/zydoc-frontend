// src/lib/doctors.ts

export async function getDoctors(searchParams?: any) {
  const params = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/doctors${query}`,
    {
      cache: "no-store",
    }
  ); 

  return res.json();
}