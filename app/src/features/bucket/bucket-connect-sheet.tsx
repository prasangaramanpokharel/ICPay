import { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import {
  Book02Icon,
  Copy01Icon,
  Key01Icon,
  Plug01Icon,
  TerminalIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Sheet } from '@/components/ui/sheet'
import { Text } from '@/components/ui/text'
import { copyText } from '@/lib/wallet-utils'
import { WALLET_CANISTER_ID } from '@/constants/images'
import type { BucketStats } from '@/services/bucket/types'

type TabKey = 'sdk' | 's3' | 'env' | 'curl'

export function BucketConnectSheet({
  bucketId,
  stats,
  open,
  onOpenChange,
  onOpenApiKeys,
}: {
  bucketId: string
  stats?: BucketStats | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenApiKeys?: () => void
}) {
  const [tab, setTab] = useState<TabKey>('sdk')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const bucketName = stats?.name || bucketId
  const isPublic = Boolean(stats?.visibility && 'open' in stats.visibility)

  const handleCopy = async (text: string, key: string) => {
    await copyText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const icpSdkInstall = 'npm i @icp-sdk/core'
  const s3Install = 'npm i @aws-sdk/client-s3 dotenv'

  const icpSdkCode = `import { HttpAgent, Actor } from "@icp-sdk/core/agent";
import { IDL } from "@icp-sdk/core/candid";
import { Principal } from "@icp-sdk/core/principal";

const CANISTER_ID = "${WALLET_CANISTER_ID}";
const BUCKET_NAME = "${bucketName}";
const API_KEY = process.env.IC_API_KEY || "YOUR_API_KEY";

// Initialize IC HTTP Agent
const agent = await HttpAgent.create({ host: "https://icp0.io" });

// Direct public file URL (CDN):
// https://cloud.icpay.app/${bucketName}/uploads/avatar.png`

  const s3ClientCode = `import "dotenv/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: "https://cloud.icpay.app/s3",
  region: "auto",
  credentials: {
    accessKeyId: "${bucketName}",
    secretAccessKey: process.env.IC_API_KEY || "YOUR_API_KEY",
  },
});

// Upload an object
await s3.send(
  new PutObjectCommand({
    Bucket: "${bucketName}",
    Key: "uploads/hello.txt",
    Body: "Hello from ICPay Cloud!",
  })
);`

  const envCode = `# ICPay Cloud Storage Config
IC_CANISTER_ID="${WALLET_CANISTER_ID}"
IC_BUCKET_ID="${bucketId}"
IC_BUCKET_NAME="${bucketName}"
IC_HOST="https://icp0.io"
IC_CDN_URL="https://cloud.icpay.app"

# S3 Compatibility
AWS_ENDPOINT_URL_S3="https://cloud.icpay.app/s3"
AWS_ACCESS_KEY_ID="${bucketName}"
AWS_SECRET_ACCESS_KEY="YOUR_API_KEY"
AWS_REGION="auto"`

  const curlCode = `# Upload file via HTTP API
curl -X PUT "https://cloud.icpay.app/${bucketName}/file.txt" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: text/plain" \\
  --data-binary @file.txt

# Download public file directly
curl -O "https://cloud.icpay.app/${bucketName}/file.txt"`

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Connect to bucket"
      description="Code snippets and configuration to connect your app."
    >
      <View className="gap-4 pb-6">
        {/* Bucket Meta Badge Bar */}
        <View className="flex-row flex-wrap items-center gap-2 rounded-2xl border border-border/60 bg-muted/30 p-3">
          <Text className="text-xs text-muted-foreground">Bucket:</Text>
          <Text className="font-mono text-xs font-semibold text-foreground">{bucketName}</Text>
          <Badge variant={isPublic ? 'default' : 'secondary'} className="text-[10px]">
            {isPublic ? 'Public' : 'Private'}
          </Badge>
          <Text className="font-mono text-[11px] text-muted-foreground">
            {WALLET_CANISTER_ID.slice(0, 8)}…
          </Text>
        </View>

        {/* Tab Selector */}
        <View className="flex-row rounded-full bg-muted p-1">
          {(
            [
              { key: 'sdk', label: '@icp-sdk' },
              { key: 's3', label: 'S3 client' },
              { key: 'env', label: '.env' },
              { key: 'curl', label: 'cURL' },
            ] as const
          ).map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              className={`min-h-9 flex-1 items-center justify-center rounded-full ${
                tab === item.key ? 'bg-background shadow-sm' : ''
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  tab === item.key ? 'text-foreground font-semibold' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab Contents */}
        {tab === 'sdk' ? (
          <View className="gap-3">
            {/* Install Bar */}
            <View className="flex-row items-center justify-between rounded-2xl border border-border/70 bg-card p-3">
              <View className="flex-row items-center gap-2">
                <Icon icon={TerminalIcon} size={15} color="#888" />
                <Text className="font-mono text-xs text-foreground">{icpSdkInstall}</Text>
              </View>
              <Pressable
                onPress={() => void handleCopy(icpSdkInstall, 'install-sdk')}
                className="rounded-lg bg-muted px-2.5 py-1 active:opacity-70"
              >
                <Text className="text-[11px] font-medium text-foreground">
                  {copiedKey === 'install-sdk' ? 'Copied' : 'Copy'}
                </Text>
              </Pressable>
            </View>

            {/* Code Snippet Box */}
            <View className="rounded-2xl border border-border/70 bg-muted/40 p-3.5">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-[11px] font-medium text-muted-foreground">client.ts</Text>
                <Pressable
                  onPress={() => void handleCopy(icpSdkCode, 'code-sdk')}
                  className="flex-row items-center gap-1 rounded-md bg-card px-2 py-0.5 border border-border/60"
                >
                  <Icon
                    icon={copiedKey === 'code-sdk' ? Tick02Icon : Copy01Icon}
                    size={12}
                    color="#888"
                  />
                  <Text className="text-[10px] font-medium text-foreground">
                    {copiedKey === 'code-sdk' ? 'Copied' : 'Copy code'}
                  </Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text className="font-mono text-[11px] leading-relaxed text-foreground">
                  {icpSdkCode}
                </Text>
              </ScrollView>
            </View>
          </View>
        ) : null}

        {tab === 's3' ? (
          <View className="gap-3">
            {/* Install Bar */}
            <View className="flex-row items-center justify-between rounded-2xl border border-border/70 bg-card p-3">
              <View className="flex-row items-center gap-2">
                <Icon icon={TerminalIcon} size={15} color="#888" />
                <Text className="font-mono text-xs text-foreground">{s3Install}</Text>
              </View>
              <Pressable
                onPress={() => void handleCopy(s3Install, 'install-s3')}
                className="rounded-lg bg-muted px-2.5 py-1 active:opacity-70"
              >
                <Text className="text-[11px] font-medium text-foreground">
                  {copiedKey === 'install-s3' ? 'Copied' : 'Copy'}
                </Text>
              </Pressable>
            </View>

            {/* Code Snippet Box */}
            <View className="rounded-2xl border border-border/70 bg-muted/40 p-3.5">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-[11px] font-medium text-muted-foreground">s3-client.ts</Text>
                <Pressable
                  onPress={() => void handleCopy(s3ClientCode, 'code-s3')}
                  className="flex-row items-center gap-1 rounded-md bg-card px-2 py-0.5 border border-border/60"
                >
                  <Icon
                    icon={copiedKey === 'code-s3' ? Tick02Icon : Copy01Icon}
                    size={12}
                    color="#888"
                  />
                  <Text className="text-[10px] font-medium text-foreground">
                    {copiedKey === 'code-s3' ? 'Copied' : 'Copy code'}
                  </Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text className="font-mono text-[11px] leading-relaxed text-foreground">
                  {s3ClientCode}
                </Text>
              </ScrollView>
            </View>
          </View>
        ) : null}

        {tab === 'env' ? (
          <View className="gap-3">
            <View className="rounded-2xl border border-border/70 bg-muted/40 p-3.5">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-[11px] font-medium text-muted-foreground">.env</Text>
                <Pressable
                  onPress={() => void handleCopy(envCode, 'code-env')}
                  className="flex-row items-center gap-1 rounded-md bg-card px-2 py-0.5 border border-border/60"
                >
                  <Icon
                    icon={copiedKey === 'code-env' ? Tick02Icon : Copy01Icon}
                    size={12}
                    color="#888"
                  />
                  <Text className="text-[10px] font-medium text-foreground">
                    {copiedKey === 'code-env' ? 'Copied' : 'Copy .env'}
                  </Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text className="font-mono text-[11px] leading-relaxed text-foreground">{envCode}</Text>
              </ScrollView>
            </View>
          </View>
        ) : null}

        {tab === 'curl' ? (
          <View className="gap-3">
            <View className="rounded-2xl border border-border/70 bg-muted/40 p-3.5">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-[11px] font-medium text-muted-foreground">cURL</Text>
                <Pressable
                  onPress={() => void handleCopy(curlCode, 'code-curl')}
                  className="flex-row items-center gap-1 rounded-md bg-card px-2 py-0.5 border border-border/60"
                >
                  <Icon
                    icon={copiedKey === 'code-curl' ? Tick02Icon : Copy01Icon}
                    size={12}
                    color="#888"
                  />
                  <Text className="text-[10px] font-medium text-foreground">
                    {copiedKey === 'code-curl' ? 'Copied' : 'Copy cURL'}
                  </Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text className="font-mono text-[11px] leading-relaxed text-foreground">
                  {curlCode}
                </Text>
              </ScrollView>
            </View>
          </View>
        ) : null}

        {/* Footer actions */}
        <View className="mt-2 flex-row items-center gap-2">
          {onOpenApiKeys ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl"
              onPress={() => {
                onOpenChange(false)
                onOpenApiKeys()
              }}
            >
              Manage API Keys
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 rounded-xl"
            onPress={() => onOpenChange(false)}
          >
            Close
          </Button>
        </View>
      </View>
    </Sheet>
  )
}
