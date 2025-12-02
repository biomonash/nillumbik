import React, { forwardRef } from "react";
import { cn } from "../../../lib/utils";
import styles from "./Search.module.scss";

export interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onSearch?: (query: string) => void;
    onClear?: () => void;
    error?: boolean;
    helperText?: string;
}

/**
 * Search component
 * ----------------
 * A reusable search input with clear button and error display.
 * Uses `forwardRef` to expose the underlying input element reference to parent components.
 *
 * Benefits of forwardRef here:
 * - Parent can programmatically focus the search input or clear its value
 * - Can integrate with forms or other UI interactions without altering the component (which means that it allows changing how it works/looks in a parent component[where it is used] 
 *   without changing this original component's code)
 */
const Search = forwardRef<HTMLInputElement, SearchProps>(
    (
        {
            className,
            onSearch,
            onClear,
            error = false,
            helperText, // placeholder for error/help messages
            value,
            onChange,
            ...props
        },
        ref // forwardRef exposes this ref to parent components
    ) => {
        /**
         * Handle clearing the input.
         * Invokes the optional `onClear` callback from the parent.
         */
        const handleClear = () => {
            onClear?.();

        };
        return (
            <div className={cn(styles.searchWrapper, className)}>
                {/* Container for input + search icon + clear button */}
                <div className={cn(styles.searchContainer, { [styles.error]: error })}>
                    <i className={cn("fas fa-search", styles.searchIcon)}></i>
                    {/* Search Input field*/}
                    <input
                        type="text"
                        className={styles.searchInput}
                        value={value}
                        onChange={onChange}
                        placeholder="Search..."
                        {...props}
                        ref={ref} // Attach forwarded ref to input, allowing parent access
                    />
                    {value && (<button type="button" className={styles.clearButton} onClick={handleClear} aria-label="Clear search">
                        <i className="fa fa-times"></i>
                    </button>
                    )}
                </div>
                {helperText && <span className={cn(styles.helperText, { [styles.errorText]: error })}>{helperText}</span>}
            </div>
        );
    }
);

Search.displayName = "Search";

export default Search;
