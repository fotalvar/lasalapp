import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            {/* You can add a public header or footer here later */}
            <main>{children}</main>
        </div>
    )
}
