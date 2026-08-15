"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
	id: string;
	name: string;
	defaultValue?: string;
	required?: boolean;
	disabled?: boolean;
	placeholder?: string;
	className?: string;
}

function parseDateValue(value?: string) {
	if (!value) return undefined;

	const [year, month, day] = value.split("-").map(Number);
	if (!year || !month || !day) return undefined;

	const date = new Date(year, month - 1, day);
	return Number.isNaN(date.getTime()) ? undefined : date;
}

function toDateValue(date?: Date) {
	if (!date) return "";

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function DatePickerField({
	id,
	name,
	defaultValue,
	required,
	disabled,
	placeholder = "Pick a date",
	className,
}: DatePickerFieldProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(() =>
		parseDateValue(defaultValue),
	);

	function handleSelect(date?: Date) {
		setSelectedDate(date);
		if (date) setIsOpen(false);
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<input
				type="hidden"
				name={name}
				value={toDateValue(selectedDate)}
				required={required}
			/>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					disabled={disabled}
					aria-label={
						selectedDate
							? `Change date, currently ${format(selectedDate, "MMMM d, yyyy")}`
							: placeholder
					}
					className={cn(
						"w-full justify-between bg-control px-4 font-normal text-foreground hover:bg-control",
						!selectedDate && "text-muted-foreground",
						className,
					)}
				>
					<span>
						{selectedDate ? format(selectedDate, "MM/dd/yyyy") : placeholder}
					</span>
					<CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[min(19rem,calc(100vw-2rem))] rounded-xl border-border p-2 shadow-lg"
				align="start"
				sideOffset={6}
			>
				<Calendar
					mode="single"
					selected={selectedDate}
					defaultMonth={selectedDate}
					onSelect={handleSelect}
					className="w-full bg-transparent p-1 [--cell-size:2.25rem]"
					classNames={{
						root: "w-full",
						month: "w-full",
						month_grid: "w-full",
					}}
					autoFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
