import { createContext, useState, useEffect, useContext, type ReactNode } from "react";

// AppContext Interface
interface AppContextType {
    theme: string;
    setTheme: (theme: string) => void;
    toggleTheme: () => void;
}

// Create Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// AppContextProvider Props
interface AppContextProviderProps {
    children: ReactNode;
}


// AppContextProvider Component
export const AppContextProvider = ({ children }: AppContextProviderProps) => {

    // State for theme
    const [theme, setTheme] = useState<string>(
        localStorage.getItem("theme") || "dark"
    );

    // Effect to apply theme and save to localStorage
    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);


    // Function to toggle theme
    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <AppContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </AppContext.Provider>
    );
};


// Custom Hook to use AppContext
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppContextProvider");
    }
    return context;
};