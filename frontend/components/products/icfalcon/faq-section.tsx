"use client"

import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

const FAQ_IDS = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
] as const

export function FaqSection() {
  const t = useTranslations("publicSite.icfalcon.faq")

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mb-12 text-center space-y-3"
          >
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              {t("title")}
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <Accordion>
              {FAQ_IDS.map((id, i) => (
                <AccordionItem key={id} value={`item-${i}`}>
                  <AccordionTrigger>{t(`items.${id}.question`)}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(`items.${id}.answer`)}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
