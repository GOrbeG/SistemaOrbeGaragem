import { jsx as _jsx } from "react/jsx-runtime";
import clsx from 'clsx';
const Card = ({ children, className, onClick }) => {
    return (_jsx("div", { onClick: onClick, className: clsx("bg-white rounded-xl shadow-md p-4", className), children: children }));
};
export default Card;
