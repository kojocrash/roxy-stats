import { ChangeEventHandler, FocusEventHandler } from 'react';
interface SearchInputProps {
    searchString: string;
    setSearchString: ChangeEventHandler<HTMLInputElement>;
    autoFocus: boolean;
    onBlur: FocusEventHandler<HTMLInputElement>;
    onFocus: FocusEventHandler<HTMLInputElement>;
    onClear: Function;
    placeholder: string;
    showIcon: boolean;
    showClear: boolean;
}
export default function SearchInput({ searchString, setSearchString, autoFocus, onBlur, onFocus, onClear, placeholder, showIcon, showClear }: SearchInputProps): JSX.Element;
export {};
