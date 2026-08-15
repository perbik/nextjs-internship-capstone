import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { type ButtonProps, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
	return (
		<nav
			aria-label="pagination"
			className={cn("mx-auto flex w-full justify-center", className)}
			{...props}
		/>
	);
}

function PaginationContent({
	className,
	...props
}: React.ComponentProps<"ul">) {
	return <ul className={cn("flex items-center gap-1", className)} {...props} />;
}

const PaginationItem = (props: React.ComponentProps<"li">) => <li {...props} />;

type PaginationLinkProps = {
	isActive?: boolean;
	disabled?: boolean;
} & Pick<ButtonProps, "size"> &
	React.ComponentProps<typeof Link>;

function PaginationLink({
	className,
	isActive,
	disabled,
	size = "icon",
	"aria-disabled": ariaDisabled,
	tabIndex,
	...props
}: PaginationLinkProps) {
	return (
		<Link
			aria-current={isActive ? "page" : undefined}
			aria-disabled={disabled || ariaDisabled}
			tabIndex={disabled ? -1 : tabIndex}
			className={cn(
				buttonVariants({ variant: isActive ? "outline" : "ghost", size }),
				disabled && "pointer-events-none opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

function PaginationPrevious({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Go to previous page"
			size="default"
			className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
			{...props}
		>
			<ChevronLeft aria-hidden="true" />
			<span>Previous</span>
		</PaginationLink>
	);
}

function PaginationNext({
	className,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Go to next page"
			size="default"
			className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
			{...props}
		>
			<span>Next</span>
			<ChevronRight aria-hidden="true" />
		</PaginationLink>
	);
}

function PaginationEllipsis({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			aria-hidden="true"
			className={cn("flex size-9 items-center justify-center", className)}
			{...props}
		>
			<MoreHorizontal className="size-4" />
			<span className="sr-only">More pages</span>
		</span>
	);
}

export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
};
