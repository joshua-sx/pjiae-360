import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tableVariants = cva("w-full caption-bottom", {
  variants: {
    density: {
      compact: "text-xs",
      comfortable: "text-sm",
      spacious: "text-base",
    },
  },
  defaultVariants: {
    density: "comfortable",
  },
})

const tableRowVariants = cva(
  "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
  {
    variants: {
      density: {
        compact: "",
        comfortable: "",
        spacious: "",
      },
    },
    defaultVariants: {
      density: "comfortable",
    },
  }
)

const tableHeadVariants = cva(
  "text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      density: {
        compact: "h-8 px-2 py-1",
        comfortable: "h-12 px-4 py-2",
        spacious: "h-16 px-6 py-4",
      },
    },
    defaultVariants: {
      density: "comfortable",
    },
  }
)

const tableCellVariants = cva(
  "align-middle [&:has([role=checkbox])]:pr-0",
  {
    variants: {
      density: {
        compact: "p-2",
        comfortable: "p-4",
        spacious: "p-6",
      },
    },
    defaultVariants: {
      density: "comfortable",
    },
  }
)

export interface TableProps
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, density, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn(tableVariants({ density, className }))}
        {...props}
      />
    </div>
  )
)
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement>,
    VariantProps<typeof tableRowVariants> {}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, density, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(tableRowVariants({ density, className }))}
      {...props}
    />
  )
)
TableRow.displayName = "TableRow"

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof tableHeadVariants> {}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, density, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(tableHeadVariants({ density, className }))}
      {...props}
    />
  )
)
TableHead.displayName = "TableHead"

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement>,
    VariantProps<typeof tableCellVariants> {}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, density, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(tableCellVariants({ density, className }))}
      {...props}
    />
  )
)
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
