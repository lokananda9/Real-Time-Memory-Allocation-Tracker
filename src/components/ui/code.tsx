
import * as React from "react"
 
import { cn } from "@/lib/utils"
 
interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {}
 
const Code = React.forwardRef<HTMLPreElement, CodeProps>(
  ({ className, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn(
          "bg-gray-900 rounded-md text-sm overflow-auto whitespace-pre py-3 px-3 text-white max-h-[300px]",
          className
        )}
        {...props}
      />
    )
  }
)

Code.displayName = "Code"
 
export { Code }
