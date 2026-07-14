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

export async function getDoctorById(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/doctors/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export const getDoctorsList = async (searchParams?: any) => {
    const response = await getDoctors(searchParams);
    if (!response || !response.doctors) {
        return { doctors: [], pagination: null };
    }

    const doctors = response.doctors.map((doc: any) => {
        const hasVideo = doc.consultationSettings?.video?.enabled;
        const hasPhysical = doc.consultationSettings?.physical?.enabled;
        let typeStr = "Online & In-person";
        if (hasVideo && !hasPhysical) {
            typeStr = "Online only";
        } else if (!hasVideo && hasPhysical) {
            typeStr = "In-person only";
        }

        const fee = doc.consultationSettings?.video?.enabled 
            ? (doc.consultationSettings?.video?.fee ?? 0)
            : (doc.consultationSettings?.physical?.fee ?? 0);

        const videoFee = hasVideo ? (doc.consultationSettings?.video?.fee ?? 0) : null;
        const physicalFee = hasPhysical ? (doc.consultationSettings?.physical?.fee ?? 0) : null;
        const clinicName = doc.consultationSettings?.physical?.clinicName || "";
        const clinicAddress = doc.consultationSettings?.physical?.clinicAddress || "";

        const location = doc.consultationSettings?.physical?.clinicAddress || "Online / Remote";
        let image = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=300&fit=crop";
        if (doc.avatarUrl) {
            if (doc.avatarUrl.startsWith('http://') || doc.avatarUrl.startsWith('https://')) {
                image = doc.avatarUrl;
            } else {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001';
                const cleanPath = doc.avatarUrl.startsWith('/') ? doc.avatarUrl : `/${doc.avatarUrl}`;
                image = `${baseUrl}${cleanPath}`;
            }
        }

        return {
            id: String(doc.id || doc._id),
            name: doc.name || `${doc.firstName || ""} ${doc.lastName || ""}`.trim() || "Doctor",
            specialty: doc.specialty || "General Practitioner",
            experience: `${doc.yearsOfExperience || 0} years experience`,
            location: location,
            type: typeStr,
            rating: doc.rating ?? 5.0,
            reviews: doc.reviewCount ?? 0,
            fee: fee,
            videoFee: videoFee,
            physicalFee: physicalFee,
            clinicName: clinicName,
            clinicAddress: clinicAddress,
            image: image
        }; 
    });

    return { doctors, pagination: response.pagination };
};