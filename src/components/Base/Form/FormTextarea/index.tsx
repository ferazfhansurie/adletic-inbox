import { useContext, forwardRef } from "react";
import { formInlineContext } from "../FormInline";
import { inputGroupContext } from "../InputGroup";
import { twMerge } from "tailwind-merge";

interface FormTextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  formTextareaSize?: "sm" | "lg";
  rounded?: boolean;
}

type FormTextareaRef = React.ComponentPropsWithRef<"textarea">["ref"];

const FormTextarea = forwardRef(
  (props: FormTextareaProps, ref: FormTextareaRef) => {
    const formInline = useContext(formInlineContext);
    const inputGroup = useContext(inputGroupContext);
    const { formTextareaSize, rounded, ...computedProps } = props;
    return (
      <textarea
        {...computedProps}
        ref={ref}
        className={twMerge([
          "disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-60 dark:disabled:bg-muted/40 dark:disabled:border-transparent",
          "[&[readonly]]:bg-muted [&[readonly]]:cursor-not-allowed [&[readonly]]:opacity-80 [&[readonly]]:dark:bg-muted/40 [&[readonly]]:dark:border-transparent",
          "transition-colors duration-150 ease-in-out w-full text-sm border border-border rounded-lg bg-background py-2 px-3 placeholder:text-muted-foreground/70 focus:outline-none focus:ring-3 focus:ring-ring/40 focus:border-ring dark:bg-card dark:border-border/20 dark:placeholder:text-muted-foreground/60",
          props.formTextareaSize == "sm" && "text-xs py-1.5 px-2",
          props.formTextareaSize == "lg" && "text-lg py-1.5 px-4",
          props.rounded && "rounded-full",
          formInline && "flex-1",
          inputGroup &&
            "rounded-none [&:not(:first-child)]:border-l-transparent first:rounded-l last:rounded-r z-10",
          props.className,
        ])}
      />
    );
  }
);

export default FormTextarea;
