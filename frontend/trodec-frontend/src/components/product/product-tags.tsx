import { Badge } from "@/components/ui/badge";

interface ProductTagsProps {
    tags?: string[];
}

export function ProductTags({ tags }: ProductTagsProps) {
    if (!tags || tags.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag) => (
                <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] px-2 py-0.5 rounded-sm"
                >
                    {tag}
                </Badge>
            ))}
        </div>
    );
}
