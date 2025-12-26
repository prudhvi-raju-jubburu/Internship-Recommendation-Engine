// Configuration for application URLs
// You can customize this to point to your actual application portal

export const APPLICATION_CONFIG = {
  // Option 1: Use a generic application form (Google Forms, Typeform, etc.)
  // applicationUrl: "https://forms.gle/your-form-id-here",
  
  // Option 2: Use LinkedIn job search (current default)
  useLinkedIn: true,
  
  // Option 3: Use a custom application portal
  // customBaseUrl: "https://your-application-portal.com/apply",
  
  // Option 4: Use Indeed job search
  // useIndeed: true,
};

// Function to generate application URL
export const getApplicationUrl = (internship) => {
  const title = encodeURIComponent(internship.Title || "Internship");
  const location = encodeURIComponent(internship.Location || "");
  
  // If you have a direct application URL in the internship data, use it
  if (internship.Application_URL || internship.URL || internship.Link) {
    return internship.Application_URL || internship.URL || internship.Link;
  }
  
  // Default: LinkedIn job search
  if (APPLICATION_CONFIG.useLinkedIn) {
    return `https://www.linkedin.com/jobs/search/?keywords=${title}&location=${location}`;
  }
  
  // Custom application portal
  if (APPLICATION_CONFIG.customBaseUrl) {
    return `${APPLICATION_CONFIG.customBaseUrl}?title=${title}&location=${location}`;
  }
  
  // Indeed job search
  if (APPLICATION_CONFIG.useIndeed) {
    return `https://www.indeed.com/jobs?q=${title}&l=${location}`;
  }
  
  // Fallback to generic application form
  return APPLICATION_CONFIG.applicationUrl || `https://www.linkedin.com/jobs/search/?keywords=${title}&location=${location}`;
};


