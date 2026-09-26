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
│   │   ├── forgot-password
│   │   │   └── page.tsx
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
│   │   │   ├── analytics   
│   │   │   │   ├── AnalyticsClient.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── appointments
│   │   │   │   └── page.tsx
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
│   │   │   ├── financials  
│   │   │   │   ├── FinancialsClient.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx  
│   │   │   ├── notifications
│   │   │   │   └── page.tsx
│   │   │   ├── patients    
│   │   │   │   ├── page.tsx
│   │   │   │   └── patients.css
│   │   │   ├── refunds     
│   │   │   │   └── page.tsx
│   │   │   ├── settings    
│   │   │   │   └── page.tsx
│   │   │   ├── transactions
│   │   │   │   ├── page.tsx
│   │   │   │   └── TransactionsClient.tsx
│   │   │   └── users       
│   │   │       ├── new     
│   │   │       └── [id]    
│   │   │           └── edit
│   │   ├── admin.css       
│   │   ├── layout.tsx      
│   │   └── page.tsx
│   ├── api
│   │   ├── auth
│   │   │   ├── login       
│   │   │   │   └── route.ts
│   │   │   ├── logout      
│   │   │   │   └── route.ts
│   │   │   ├── me
│   │   │   │   └── route.ts
│   │   │   ├── refresh     
│   │   │   │   └── route.ts
│   │   │   ├── set-role    
│   │   │   │   └── route.ts
│   │   │   └── verify-otp  
│   │   │       └── route.ts
│   │   └── firebase-config 
│   │       └── route.ts    
│   ├── doctor
│   │   ├── (protected)     
│   │   │   ├── appointments
│   │   │   │   └── page.tsx
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
│   │   │   ├── consultation
│   │   │   │   └── [id]    
│   │   │   │       ├── layout.tsx
│   │   │   │       └── page.tsx
│   │   │   ├── dashboard   
│   │   │   │   ├── doctor-dashboard.css
│   │   │   │   ├── doctor-dashboardClient.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── doctor-premium.css
│   │   │   ├── earnings    
│   │   │   │   ├── EarningsClient.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx  
│   │   │   ├── notifications
│   │   │   │   └── page.tsx
│   │   │   ├── patients    
│   │   │   │   └── page.tsx
│   │   │   ├── prescriptions
│   │   │   │   └── page.tsx
│   │   │   ├── profile     
│   │   │   │   ├── edit    
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── edit2   
│   │   │   │   │   ├── BankDetailsSection.tsx
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
│   │   │   └── security    
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
│       │   ├── consultation
│       │   │   └── [id]    
│       │   │       ├── layout.tsx
│       │   │       └── page.tsx
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
│       │   ├── my-doctors  
│       │   │   └── page.tsx
│       │   ├── notifications
│       │   │   └── page.tsx
│       │   ├── patient-premium.css
│       │   ├── prescriptions
│       │   │   └── page.tsx
│       │   ├── profile     
│       │   │   ├── edit-profile
│       │   │   │   └── page.tsx
│       │   │   └── page.tsx
│       │   ├── profile-update
│       │   │   └── page.tsx
│       │   ├── records     
│       │   │   └── page.tsx
│       │   ├── security    
│       │   │   └── page.tsx
│       │   └── wallet      
│       │       └── page.tsx
│       └── layout.tsx      
├── components
│   ├── admin
│   │   ├── AdminDashboardClient.tsx
│   │   ├── appointments    
│   │   │   └── AppointmentDetailModal.tsx
│   │   ├── approvals       
│   │   │   ├── DoctorDetailsModal.tsx
│   │   │   ├── DoctorRejectionModal.tsx
│   │   │   └── PendingDoctorsTable.tsx
│   │   ├── common
│   │   │   ├── DataTable.tsx
│   │   │   └── StatusToggleConfirmModal.tsx
│   │   ├── dashboard       
│   │   │   ├── DashboardQuickActions.tsx
│   │   │   ├── KPISummaryCards.tsx
│   │   │   ├── RevenueChartWidget.tsx
│   │   │   └── TopDoctorsWidget.tsx
│   │   ├── doctors
│   │   │   └── DoctorDetailDrawer.tsx
│   │   ├── patients        
│   │   │   └── PatientDetailDrawer.tsx
│   │   ├── refunds
│   │   │   ├── PendingRefundsTable.tsx
│   │   │   ├── RefundDetailsModal.tsx
│   │   │   └── RefundRejectionModal.tsx
│   │   ├── settings        
│   │   │   ├── CommissionChangeHistory.tsx
│   │   │   └── CommissionSettingsForm.tsx
│   │   └── SystemHealthCard.tsx
│   ├── auth
│   │   ├── AuthGuard.tsx   
│   │   ├── AuthHydrator.tsx
│   │   └── GuestGuard.tsx  
│   ├── common
│   │   └── TimeSelect.tsx  
│   ├── doctor
│   │   ├── DoctorBottomNav 
│   │   │   └── index.tsx   
│   │   └── ScheduleManager 
│   │       └── index.tsx   
│   ├── doctor-profile      
│   │   └── DoctorProfileView.tsx
│   ├── FcmTokenManager.tsx 
│   ├── find-doctor
│   │   ├── DoctorFilters.tsx
│   │   └── DoctorList.tsx  
│   ├── FirebaseAuthProvider.tsx
│   ├── forms
│   │   ├── AdminLoginForm.tsx
│   │   ├── ChangePasswordForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── UnifiedLoginForm.tsx
│   │   └── UnifiedSignupForm.tsx
│   ├── landing
│   │   ├── CTA.tsx
│   │   ├── DoctorSearchSection.tsx
│   │   ├── FAQ.tsx
│   │   ├── Features.tsx    
│   │   ├── Footer.tsx      
│   │   ├── Hero.tsx        
│   │   ├── HowItWorks.tsx  
│   │   ├── Navbar.tsx      
│   │   ├── Specialists.tsx 
│   │   └── Testimonials.tsx
│   ├── layout
│   │   ├── AppShell.tsx    
│   │   ├── AuthHeader.tsx  
│   │   ├── dashboard-layout.css
│   │   ├── Footer.tsx      
│   │   ├── Header.tsx      
│   │   ├── Sidebar.tsx     
│   │   └── Topbar.tsx      
│   ├── notifications       
│   │   └── NotificationList.tsx
│   ├── patient
│   │   ├── BookButton.tsx  
│   │   ├── PatientBottomNav
│   │   │   └── index.tsx   
│   │   └── SlotPicker      
│   │       └── index.tsx   
│   ├── shared
│   └── ui
│       ├── Badge.tsx       
│       ├── Button.tsx      
│       └── Input.tsx       
├── config
│   └── videoCallConfig.ts  
├── constants
│   └── systemsOfMedicine.ts
├── hooks
│   ├── useAppointmentTracker.ts
│   ├── useFcmToken.ts      
│   └── useSocket.ts        
├── lib
│   ├── adminDashboardData.ts
│   ├── appointments.ts     
│   ├── doctors.ts
│   ├── firebase
│   │   ├── client.ts
│   │   └── messaging.ts    
│   └── utils.ts
├── middleware.ts
├── modules
│   ├── reviews-ratings     
│   │   ├── components      
│   │   │   ├── DoctorProfileReviewsSection.tsx
│   │   │   ├── DoctorRatingBreakdown.tsx
│   │   │   ├── DoctorReviewsList.tsx
│   │   │   ├── RatingStars.tsx
│   │   │   └── ReviewModal.tsx
│   │   ├── index.ts        
│   │   ├── services        
│   │   │   └── reviewService.ts
│   │   └── types
│   │       └── index.ts    
│   └── video-call
│       ├── components      
│       │   ├── CallControls.tsx
│       │   ├── CallExitConfirmModal.tsx
│       │   ├── CallHeader.tsx
│       │   ├── ConsultationSidebar.tsx
│       │   ├── DuplicateTabFallback.tsx
│       │   ├── sidebar     
│       │   │   ├── ChatTab.tsx
│       │   │   ├── FilesTab.tsx
│       │   │   ├── NotesTab.tsx
│       │   │   ├── PatientInfoTab.tsx
│       │   │   ├── PrescriptionTab.tsx
│       │   │   └── types.ts
│       │   ├── VideoCallNotificationManager.tsx        
│       │   ├── VideoCallRoom.tsx
│       │   ├── VideoStage.tsx
│       │   └── WaitingOverlay.tsx
│       ├── hooks
│       │   ├── useCallTabSync.ts
│       │   ├── useCallTimer.ts
│       │   ├── usePreventCallExit.ts
│       │   ├── useVideoCallNotifications.tsx
│       │   └── useWebRTC.ts
│       └── index.ts        
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
│   │   ├── appointment     
│   │   │   ├── appointmentService.ts
│   │   │   ├── appointmentSlice.ts
│   │   │   └── appointmentThunk.ts
│   │   ├── consultation    
│   │   │   └── consultationSlice.ts
│   │   ├── doctor
│   │   │   ├── doctorService.ts
│   │   │   ├── doctorSlice.ts
│   │   │   └── doctorThunk.ts
│   │   ├── notification    
│   │   │   ├── notificationService.ts
│   │   │   ├── notificationSlice.ts
│   │   │   └── notificationThunk.ts
│   │   ├── patient
│   │   │   ├── patientService.ts
│   │   │   ├── patientSlice.ts
│   │   │   └── patientThunk.ts
│   │   └── wallet
│   │       ├── walletService.ts
│   │       ├── walletSlice.ts
│   │       └── walletThunk.ts
│   ├── hooks.ts
│   ├── provider.tsx        
│   └── store.ts
├── types
│   └── index.ts
└── utils
    ├── appointmentStatus.ts
    ├── generatePrescriptionPdf.ts
    ├── scheduleValidator.ts
    └── timeFormat.ts  


 `