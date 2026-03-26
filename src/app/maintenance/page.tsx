import ThemeToggle from "@/components/shared/ThemeToggle";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Under Maintenance
            </h1>
            <p className="text-muted-foreground text-lg">
              We're currently performing scheduled maintenance to improve your
              experience.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            If you need immediate assistance, please contact your system
            administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
