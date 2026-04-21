// Elements
import PageNumbers from "./elements/PageNumbers";
import Previous from "./elements/Previous";
import Next from "./elements/Next";

const Pagination = ({
    baseSlug = "campaigns",
    subDir = "page",
    current = 1,
    total = 1,
}) => {
    return (
        <div className="flex justify-center items-center gap-[6px]">
            <Previous baseSlug={baseSlug} subDir={subDir} current={current} />

            <PageNumbers total={total} current={current} />

            <Next
                baseSlug={baseSlug}
                subDir={subDir}
                current={current}
                total={total}
            />
        </div>
    );
};

export default Pagination;
