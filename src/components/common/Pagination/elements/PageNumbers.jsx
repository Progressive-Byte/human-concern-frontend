import React from "react";
import Link from "next/link";

const Pagination = ({ total = 1, current = 1 }) => {
    const pageNumbers = [];

    // Always add the first page
    pageNumbers.push(1);

    if (total <= 5) {
        // If total pages are 5 or less, show all pages
        for (let i = 2; i <= total; i++) {
            pageNumbers.push(i);
        }
    } else {
        // Determine the middle pages based on current page
        if (current <= 3) {
            // Current page is among the first three
            for (let i = 2; i <= 3; i++) {
                pageNumbers.push(i);
            }

            pageNumbers.push("...");
        } else if (current >= total - 2) {
            // Current page is among the last three
            pageNumbers.push("...");

            for (let i = total - 2; i < total; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Current page is somewhere in the middle
            pageNumbers.push("...");
            // pageNumbers.push(current - 1);
            pageNumbers.push(current);
            // pageNumbers.push(current + 1);
            pageNumbers.push("...");
        }
    }

    // Always add the last page if total is more than 5
    if (total > 5) {
        pageNumbers.push(total);
    }

    return (
        <div className="flex justify-center items-center gap-[6px]">
            {pageNumbers.map((number, index) => {
                return number === "..." ? (
                    <div
                        key={index}
                        className={`flex items-center gap-1 text-[10px] md:text-sm font-inter font-normal py-2 px-3 border 
                        text-body border-body/10 rounded cursor-not-allowed`}
                    >
                        {number}
                    </div>
                ) : (
                    <Link
                        key={index}
                        href={`/plugins/page/${number}`}
                        className={`flex items-center gap-1 text-[10px] md:text-sm font-inter font-normal py-2 px-3 border ${
                            number === Number(current)
                                ? "border-primary bg-primary text-white"
                                : "text-body border-body/10 hover:bg-transparent"
                        } border-body/10 rounded hover:border-primary`}
                    >
                        {number}
                    </Link>
                );
            })}
        </div>
    );
};

export default Pagination;
