import Image from "next/image";
import Link from "next/link";

export default function Previous({
    baseSlug = "plugins",
    subDir = "page",
    current = 1,
}) {
    return (
        <>
            {current > 1 ? (
                <>
                    <Link
                        href={`/${baseSlug}`}
                        className="group pl-navigation-button"
                    >
                        <div>
                            <Image
                                src="/plugins/arrow-first.png"
                                width={16}
                                height={16}
                                alt="arrow"
                                className="block pointer-events-none"
                            />
                        </div>
                        <span>First</span>
                    </Link>
                    <Link
                        href={`/${baseSlug}/${subDir}/${parseInt(current) - 1}`}
                        className="group pl-navigation-button"
                    >
                        <div>
                            <Image
                                src="/plugins/arrow-left.png"
                                width={16}
                                height={16}
                                alt="arrow"
                                className="block w-3 h-3 md:w-4 md:h-4 pointer-events-none"
                            />
                        </div>
                        <span>Back</span>
                    </Link>
                </>
            ) : (
                <>
                    <div
                        className="hidden md:flex items-center gap-1 text-body text-sm font-inter font-normal 
                        py-2 px-3 border border-body/10 rounded cursor-not-allowed"
                    >
                        <div>
                            <Image
                                src="/plugins/arrow-first.png"
                                width={16}
                                height={16}
                                alt="arrow"
                                className="pointer-events-none"
                            />
                        </div>
                        <span>First</span>
                    </div>
                    <div
                        className="flex items-center gap-[2px] md:gap-1 text-body text-[10px] md:text-sm font-inter font-normal 
                        py-2 px-3 border border-body/10 rounded cursor-not-allowed"
                    >
                        <div>
                            <Image
                                src="/plugins/arrow-left.png"
                                width={16}
                                height={16}
                                alt="arrow"
                                className="w-3 h-3 md:w-4 md:h-4 pointer-events-none"
                            />
                        </div>
                        <span>Back</span>
                    </div>
                </>
            )}
        </>
    );
}
