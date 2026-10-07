import { DevelopmentStatus, ProblemCategory, ProblemStatus } from "@/backend";

/**
 * Bilingual copy dictionary. Hindi is the primary label; the English label is
 * rendered alongside key actions and statuses so the interface stays usable for
 * readers who are more comfortable in Latin script.
 */
export const t = {
  appName: "ग्राम पंचायत",
  appNameEn: "Village Panchayat Portal",
  tagline: "गाँव की आवाज़, पंचायत का हिसाब",
  taglineEn: "The village's voice, the panchayat's account",

  nav: {
    dashboard: "डैशबोर्ड",
    dashboardEn: "Dashboard",
    complaints: "शिकायतें",
    complaintsEn: "Complaints",
    projects: "परियोजनाएँ",
    projectsEn: "Projects",
    directory: "निर्देशिका",
    directoryEn: "Directory",
    admin: "प्रशासन",
    adminEn: "Admin",
  },

  actions: {
    reportProblem: "समस्या दर्ज करें",
    reportProblemEn: "Report a problem",
    viewAll: "सभी देखें",
    viewAllEn: "View all",
    upvote: "समर्थन करें",
    upvoteEn: "Upvote",
    search: "खोजें",
    searchEn: "Search",
    filter: "छाँटें",
    filterEn: "Filter",
    clear: "साफ़ करें",
    clearEn: "Clear",
    submit: "जमा करें",
    submitEn: "Submit",
    cancel: "रद्द करें",
    cancelEn: "Cancel",
    save: "सहेजें",
    saveEn: "Save",
    edit: "संपादित करें",
    editEn: "Edit",
    delete: "हटाएँ",
    deleteEn: "Delete",
    back: "वापस",
    backEn: "Back",
    login: "प्रशासक लॉगिन",
    loginEn: "Admin login",
    logout: "लॉगआउट",
    logoutEn: "Logout",
    retry: "पुनः प्रयास करें",
    retryEn: "Retry",
  },

  status: {
    new: "नया",
    newEn: "New",
    inProgress: "प्रगति में",
    inProgressEn: "In Progress",
    resolved: "हल हो गया",
    resolvedEn: "Resolved",
  },

  category: {
    water: "पेयजल",
    waterEn: "Water",
    road: "सड़क",
    roadEn: "Road",
    electricity: "बिजली",
    electricityEn: "Electricity",
    sanitation: "स्वच्छता",
    sanitationEn: "Sanitation",
    health: "स्वास्थ्य",
    healthEn: "Health",
    education: "शिक्षा",
    educationEn: "Education",
    other: "अन्य",
    otherEn: "Other",
  },

  developmentStatus: {
    planned: "नियोजित",
    plannedEn: "Planned",
    ongoing: "चल रहा है",
    ongoingEn: "Ongoing",
    completed: "पूर्ण",
    completedEn: "Completed",
  },

  common: {
    loading: "लोड हो रहा है…",
    loadingEn: "Loading…",
    error: "कुछ गड़बड़ हो गई",
    errorEn: "Something went wrong",
    empty: "अभी कोई जानकारी नहीं है",
    emptyEn: "Nothing here yet",
    notFound: "पृष्ठ नहीं मिला",
    notFoundEn: "Page not found",
    goHome: "मुख्य पृष्ठ पर जाएँ",
    goHomeEn: "Go to dashboard",
    upvotes: "समर्थन",
    upvotesEn: "Upvotes",
    budget: "बजट",
    budgetEn: "Budget",
    date: "दिनांक",
    dateEn: "Date",
    location: "स्थान",
    locationEn: "Location",
    photo: "फ़ोटो",
    photoEn: "Photo",
    optional: "वैकल्पिक",
    optionalEn: "Optional",
    required: "आवश्यक",
    requiredEn: "Required",
    anonymous: "गुमनाम",
    anonymousEn: "Anonymous",
    adminOnly: "केवल प्रशासक",
    adminOnlyEn: "Admins only",
  },

  footer: {
    contact: "संपर्क",
    contactEn: "Contact",
    builtWith: "निर्मित",
    builtWithEn: "Built with love using",
  },

  contact: {
    title: "संपर्क जानकारी",
    titleEn: "Contact information",
    subtitle:
      "पंचायत का संपर्क ईमेल और फ़ोन संपादित करें · Edit the panchayat contact email and phone",
    emailLabel: "संपर्क ईमेल · Contact email",
    phoneLabel: "संपर्क फ़ोन · Contact phone",
    emailPlaceholder: "जैसे: panchayat@example.in",
    phonePlaceholder: "जैसे: +91 94131 44022",
    emailRequired: "कृपया संपर्क ईमेल दर्ज करें · Please enter a contact email",
    phoneRequired: "कृपया संपर्क फ़ोन दर्ज करें · Please enter a contact phone",
    emailInvalid:
      "कृपया मान्य ईमेल पता दर्ज करें · Please enter a valid email address",
    phoneInvalid:
      "कृपया मान्य फ़ोन नंबर दर्ज करें · Please enter a valid phone number",
    saved: "संपर्क जानकारी सहेजी गई · Contact information saved",
    saveError:
      "सहेजने में त्रुटि हुई। पुनः प्रयास करें। · Could not save. Please try again.",
    loadError:
      "संपर्क जानकारी लोड नहीं हो सकी · Could not load contact information",
    preview: "फ़ुटर पूर्वावलोकन · Footer preview",
    previewHint:
      "यही जानकारी वेबसाइट के फ़ुटर में दिखाई देती है। · This is what visitors see in the site footer.",
  },
} as const;

/** Hindi + English label pair for a problem status. */
export function statusLabel(status: ProblemStatus): {
  hi: string;
  en: string;
} {
  switch (status) {
    case ProblemStatus.new:
      return { hi: t.status.new, en: t.status.newEn };
    case ProblemStatus.inProgress:
      return { hi: t.status.inProgress, en: t.status.inProgressEn };
    case ProblemStatus.resolved:
      return { hi: t.status.resolved, en: t.status.resolvedEn };
    default:
      return { hi: t.status.new, en: t.status.newEn };
  }
}

/** Hindi + English label pair for a problem category. */
export function categoryLabel(category: ProblemCategory): {
  hi: string;
  en: string;
} {
  switch (category) {
    case ProblemCategory.water:
      return { hi: t.category.water, en: t.category.waterEn };
    case ProblemCategory.road:
      return { hi: t.category.road, en: t.category.roadEn };
    case ProblemCategory.electricity:
      return { hi: t.category.electricity, en: t.category.electricityEn };
    case ProblemCategory.sanitation:
      return { hi: t.category.sanitation, en: t.category.sanitationEn };
    case ProblemCategory.health:
      return { hi: t.category.health, en: t.category.healthEn };
    case ProblemCategory.education:
      return { hi: t.category.education, en: t.category.educationEn };
    case ProblemCategory.other:
      return { hi: t.category.other, en: t.category.otherEn };
    default:
      return { hi: t.category.other, en: t.category.otherEn };
  }
}

/** Hindi + English label pair for a development update status. */
export function developmentStatusLabel(status: DevelopmentStatus): {
  hi: string;
  en: string;
} {
  switch (status) {
    case DevelopmentStatus.planned:
      return {
        hi: t.developmentStatus.planned,
        en: t.developmentStatus.plannedEn,
      };
    case DevelopmentStatus.ongoing:
      return {
        hi: t.developmentStatus.ongoing,
        en: t.developmentStatus.ongoingEn,
      };
    case DevelopmentStatus.completed:
      return {
        hi: t.developmentStatus.completed,
        en: t.developmentStatus.completedEn,
      };
    default:
      return {
        hi: t.developmentStatus.planned,
        en: t.developmentStatus.plannedEn,
      };
  }
}

/** Ordered list of all problem categories for filters and forms. */
export const PROBLEM_CATEGORIES: ProblemCategory[] = [
  ProblemCategory.water,
  ProblemCategory.road,
  ProblemCategory.electricity,
  ProblemCategory.sanitation,
  ProblemCategory.health,
  ProblemCategory.education,
  ProblemCategory.other,
];

/** Ordered list of all problem statuses for filters and forms. */
export const PROBLEM_STATUSES: ProblemStatus[] = [
  ProblemStatus.new,
  ProblemStatus.inProgress,
  ProblemStatus.resolved,
];

/** Ordered list of all development statuses for filters and forms. */
export const DEVELOPMENT_STATUSES: DevelopmentStatus[] = [
  DevelopmentStatus.planned,
  DevelopmentStatus.ongoing,
  DevelopmentStatus.completed,
];
