"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ACADEMY_FAQS } from "./academy-data"

export function AcademyFaq() {
  return (
    <section className="border-b border-border/60 bg-background py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="mb-10 space-y-3 text-center">
          <Badge variant="outline" className="px-3 py-1 text-xs">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Everything You Need to Know
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Common questions regarding prerequisites, on-chain soulbound credentials, Motoko toolchains, and local testing.
          </p>
        </div>

        <Accordion defaultValue={["faq-0"]} className="bg-card">
          {ACADEMY_FAQS.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="px-4 py-4 text-left text-sm font-semibold text-foreground md:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-xs leading-relaxed text-muted-foreground md:text-sm">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
