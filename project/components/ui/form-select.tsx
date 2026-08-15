"use client";

import { useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FormSelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

interface FormSelectProps {
	name?: string;
	id?: string;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	options: FormSelectOption[];
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	ariaLabel?: string;
	triggerClassName?: string;
	contentClassName?: string;
}

const EMPTY_VALUE = "__brix_empty_select_value__";

function encodeValue(value: string) {
	return value === "" ? EMPTY_VALUE : value;
}

function decodeValue(value: string) {
	return value === EMPTY_VALUE ? "" : value;
}

export function FormSelect({
	name,
	id,
	value,
	defaultValue = "",
	onValueChange,
	options,
	placeholder,
	disabled,
	required,
	ariaLabel,
	triggerClassName,
	contentClassName,
}: FormSelectProps) {
	const isControlled = value !== undefined;
	const [internalValue, setInternalValue] = useState(defaultValue);
	const selectedValue = isControlled ? value : internalValue;
	const hasEmptyOption = options.some((option) => option.value === "");
	const encodedValue =
		selectedValue === "" && !hasEmptyOption ? "" : encodeValue(selectedValue);

	function handleValueChange(nextValue: string) {
		const decodedValue = decodeValue(nextValue);
		if (!isControlled) setInternalValue(decodedValue);
		onValueChange?.(decodedValue);
	}

	return (
		<>
			{hasEmptyOption && name && (
				<input type="hidden" name={name} value={selectedValue} />
			)}
			<Select
				name={hasEmptyOption ? undefined : name}
				value={encodedValue}
				onValueChange={handleValueChange}
				disabled={disabled}
				required={required}
			>
				<SelectTrigger
					id={id}
					aria-label={ariaLabel}
					className={cn(
						"h-10 rounded-lg border-input bg-card text-foreground shadow-none  bg-control ",
						triggerClassName,
					)}
				>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent
					className={cn(
						"rounded-xl border-border bg-card text-foreground shadow-xl  bg-control ",
						contentClassName,
					)}
				>
					{options.map((option) => (
						<SelectItem
							key={option.value || EMPTY_VALUE}
							value={encodeValue(option.value)}
							disabled={option.disabled}
							className="rounded-lg focus:bg-brand/10 focus:text-brand"
						>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	);
}
