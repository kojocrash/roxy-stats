/// <reference types="react" />
declare type Item<T> = T & {
    [key: string]: unknown;
};
export interface ResultsProps<T> {
    results: Item<T>[];
    onClick: Function;
    onHover: (result: Item<T>) => void;
    setSearchString: Function;
    formatResult?: Function;
    showIcon: boolean;
    maxResults: number;
    resultStringKeyName: string;
}
export default function Results<T>({ results, onClick, setSearchString, showIcon, maxResults, resultStringKeyName, onHover, formatResult }: ResultsProps<T>): JSX.Element | null;
export {};
