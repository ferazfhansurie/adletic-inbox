import { useContext } from "react";
import { formInlineContext } from "../FormInline";
import { twMerge } from "tailwind-merge";

interface FormSelectProps extends React.ComponentPropsWithoutRef<"select"> {
  formSelectSize?: "sm" | "lg";
}

function FormSelect(props: FormSelectProps) {
  const formInline = useContext(formInlineContext);
  const { formSelectSize, ...computedProps } = props;
  return (
    <select
      {...computedProps}
      className={twMerge([
        "disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-60 disabled:dark:bg-muted/40",
        "[&[readonly]]:bg-muted [&[readonly]]:cursor-not-allowed [&[readonly]]:opacity-80 [&[readonly]]:dark:bg-muted/40",
        "transition-colors duration-150 ease-in-out w-full text-sm border border-border rounded-lg bg-background py-2 px-3 pr-8 focus:outline-none focus:ring-3 focus:ring-ring/40 focus:border-ring dark:bg-card dark:border-border/20",
        props.formSelectSize == "sm" && "text-xs py-1.5 pl-2 pr-8",
        props.formSelectSize == "lg" && "text-lg py-1.5 pl-4 pr-8",
        formInline && "flex-1",
        props.className,
      ])}
    >
      {props.children}
    </select>
  );
}

export default FormSelect;
