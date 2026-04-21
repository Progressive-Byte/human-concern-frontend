import Image from "next/image";
import Link from "next/link";

export default function Next({
    baseSlug = "plugins",
    subDir = "page",
    current = 1,
    total = 1,
}) {
    return (
        <>
            {current < total ? (
                <>
                    <Link
                        href={`/${baseSlug}/${subDir}/${parseInt(current) + 1}`}
                        className="group hc-navigation-button"
                    >
                        <span>Next</span>

                        <div>
                            <Image
                                src="/plugins/arrow-right.png"
                                width={16}
                                height={16}
                                alt="arrow"
                                className="block w-3 h-3 md:w-4 md:h-4 pointer-events-none"
                            />
                        </div>
                    </Link>
                    <Link
                        href={`/${baseSlug}/${subDir}/${total}`}
                        className="group hc-navigation-button"
                    >
                        <span>Last</span>

                        <div>
                            <Image
                                src="/plugins/arrow-last.png"
                                width={16}
                                height={16}
                                alt="arrow"
                                className="block pointer-events-none"
                            />
                        </div>
                    </Link>
                </>
            ) : (
                <>
                    <div
                        className="flex items-center gap-[2px] md:gap-1 text-body text-[10px] md:text-sm font-inter font-normal 
                        py-2 px-3 border border-body/10 rounded cursor-not-allowed"
                    >
                        <span>Next</span>

                        <div>
                            <Image
                                src="/plugins/arrow-right.png"
                                width={16}
                                height={16}
                                alt="arrow"
                                className="w-3 h-3 md:w-4 md:h-4 pointer-events-none"
                            />
                        </div>
                    </div>
                    <div
                        className="hidden md:flex items-center gap-1 text-body text-sm font-inter font-normal 
                        py-2 px-3 border border-body/10 rounded cursor-not-allowed"
                    >
                        <span>Last</span>

                        <div>
                            <Image
                                src="/plugins/arrow-last.png"
                                width={16}
                                height={16}
                                alt="arrow"
                                className="pointer-events-none"
                            />
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
