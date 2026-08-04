import fs from "fs";
import path from "path";

const rootDir = path.join(process.cwd(), "src");

function printTree(dir, prefix = "") {
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    const fullPath = path.join(dir, file);
    const isLast = index === files.length - 1;
    const connector = isLast ? "└── " : "├── ";

    console.log(prefix + connector + file);

    if (fs.statSync(fullPath).isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      printTree(fullPath, newPrefix);
    }
  });
}

console.log("📁 src");
printTree(rootDir);


 `  
📁 src
├── api
│   ├── axiosInstance.ts
│   └── endpoints.ts
├── app
│   ├── (auth)
│   │   ├── layout.tsx
│   │   ├── login
│   │   │   └── page.tsx
│   │   └── signup
│   │       └── page.tsx
│   ├── (public)
│   │   ├── find-doctor
│   │   │   ├── finddoctor.css
│   │   │   ├── page.tsx
│   │   │   └── [id]
│   │   │       └── page.tsx
│   │   ├── landing.css
│   │   ├── LandingClient.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── admin
│   │   ├── (auth)
│   │   │   └── login
│   │   │       ├── admin-login.css
│   │   │       └── page.tsx
│   │   ├── (protected)
│   │   │   ├── approvals
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard
│   │   │   │   ├── admin-dashboard.css
│   │   │   │   └── page.tsx
│   │   │   ├── doctors
│   │   │   │   ├── AdminDoctorsClient.tsx
│   │   │   │   ├── doctors.css
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]
│   │   │   │       └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── patients
│   │   │   │   ├── page.tsx
│   │   │   │   └── patients.css
│   │   │   └── users
│   │   │       ├── new
│   │   │       └── [id]
│   │   │           └── edit
│   │   ├── admin.css
│   │   └── layout.tsx
│   ├── api
│   │   └── auth
│   │       ├── refresh
│   │       │   └── route.ts
│   │       └── set-role
│   │           └── route.ts
│   ├── doctor
│   │   ├── (protected)
│   │   │   ├── complete-profile
│   │   │   │   ├── complete-profileClient.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── _components
│   │   │   │       ├── DraftBanner.tsx
│   │   │   │       ├── FormNavFooter.tsx
│   │   │   │       ├── StepCredentialsSection.tsx
│   │   │   │       ├── StepIdentitySection.tsx
│   │   │   │       ├── StepProgressHeader.tsx
│   │   │   │       ├── StepScheduleSection.tsx
│   │   │   │       ├── StepVerificationSection.tsx
│   │   │   │       └── types.ts
│   │   │   ├── dashboard
│   │   │   │   ├── doctor-dashboard.css
│   │   │   │   ├── doctor-dashboardClient.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── earnings
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── profile
│   │   │   │   ├── edit
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── edit2
│   │   │   │   │   ├── BasicInfoSection.tsx
│   │   │   │   │   ├── CertificatesSection.tsx
│   │   │   │   │   ├── ConsultationSection.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── PreferencesSection.tsx
│   │   │   │   │   ├── QualificationsSection.tsx
│   │   │   │   │   ├── ScheduleSection.tsx
│   │   │   │   │   └── SettingsMatrixClient.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── schedule
│   │   │   │   ├── page.tsx
│   │   │   │   └── ScheduleClient.tsx
│   │   │   └── settings
│   │   │       ├── components
│   │   │       │   ├── ClinicalCredentialsForm.tsx
│   │   │       │   ├── OperationalHoursForm.tsx
│   │   │       │   ├── PersonalInfoForm.tsx
│   │   │       │   └── VerificationDocsForm.tsx
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── [...catchAll]
│   │       └── page.tsx
│   ├── favicon.ico
│   ├── fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── globals.css
│   ├── layout.tsx
│   ├── onboarding
│   │   └── page.tsx
│   └── patient
│       ├── (protected)
│       │   ├── appointments
│       │   │   └── page.tsx
│       │   ├── dashboard
│       │   │   ├── DashBoardClient.tsx
│       │   │   ├── page.tsx
│       │   │   └── patient-dashboard.css
│       │   ├── find-doctor
│       │   │   ├── book
│       │   │   │   └── [id]
│       │   │   │       ├── BookingForm.tsx
│       │   │   │       └── page.tsx
│       │   │   ├── page.tsx
│       │   │   └── [id]
│       │   │       └── page.tsx
│       │   ├── layout.tsx
│       │   ├── profile
│       │   │   ├── edit-profile
│       │   │   │   └── page.tsx
│       │   │   └── page.tsx
│       │   ├── profile-update
│       │   │   └── page.tsx
│       │   └── records
│       │       └── page.tsx
│       └── layout.tsx
├── components
│   ├── admin
│   │   └── AdminDashboardClient.tsx
│   ├── auth
│   │   ├── AuthGuard.tsx
│   │   ├── AuthHydrator.tsx
│   │   └── GuestGuard.tsx
│   ├── doctor
│   │   └── ScheduleManager
│   │       └── index.tsx
│   ├── find-doctor
│   │   ├── DoctorFilters.tsx
│   │   └── DoctorList.tsx
│   ├── FirebaseAuthProvider.tsx
│   ├── forms
│   │   ├── AdminLoginForm.tsx
│   │   ├── UnifiedLoginForm.tsx
│   │   └── UnifiedSignupForm.tsx
│   ├── landing
│   │   ├── Blogs.tsx
│   │   ├── CTA.tsx
│   │   ├── FAQ.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── STATS.tsx
│   │   └── Testimonials.tsx
│   ├── layout
│   │   ├── AppShell.tsx
│   │   ├── AuthHeader.tsx
│   │   ├── dashboard-layout.css
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── patient
│   │   └── SlotPicker
│   │       └── index.tsx
│   ├── shared
│   └── ui
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── Input.tsx
├── hooks
├── lib
│   ├── appointments.ts
│   ├── doctors.ts
│   └── firebase
│       └── client.ts
├── middleware.ts
├── redux
│   ├── auth
│   │   ├── authService.ts
│   │   ├── authSlice.ts
│   │   ├── authThunk.ts
│   │   └── authTypes.ts
│   ├── features
│   │   ├── admin
│   │   │   ├── adminService.ts
│   │   │   ├── adminSlice.ts
│   │   │   ├── adminThunk.ts
│   │   │   └── adminTypes.ts
│   │   ├── doctor
│   │   │   ├── doctorService.ts
│   │   │   ├── doctorSlice.ts
│   │   │   └── doctorThunk.ts
│   │   └── patient
│   │       ├── patientService.ts
│   │       ├── patientSlice.ts
│   │       └── patientThunk.ts
│   ├── hooks.ts
│   ├── provider.tsx
│   └── store.ts
└── types
    └── index.ts
    
    `