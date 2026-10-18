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

type TabKey = 'node' | 'python' | 'curl' | 'env'

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
  const [tab, setTab] = useState<TabKey>('node')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const bucketName = stats?.name || bucketId
  const isPublic = Boolean(stats?.visibility && 'open' in stats.visibility)

  const handleCopy = async (text: string, key: string) => {
    await copyText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const nodeInstall = 'npm i icpay-bucket'
  const pythonInstall = 'pip install icpay-bucket ic-py'

  const nodeCode = `import { BucketClient } from "icpay-bucket";

// Initialize client with your API key
const client = new BucketClient({
  apiKey: process.env.IC_API_KEY || "YOUR_API_KEY",
});

// Upload file
const upload = await client.uploadFile({
  bucketId: "${bucketName}",
  path: "/uploads/hello.txt",
  data: new TextEncoder().encode("Hello from ICPay Cloud!"),
  contentType: "text/plain",
});
console.log("Upload result:", upload);

// List files
const files = await client.listFiles("${bucketName}", 0, 20);
console.log("Files:", files);`

  const pythonCode = `import os
from icpay_bucket import BucketClient

# Initialize client with your API key
client = BucketClient(api_key=os.environ.get("IC_API_KEY", "YOUR_API_KEY"))

# Upload file
res = client.upload_file(
    bucket_id="${bucketName}",
    path="/uploads/hello.txt",
    data=b"Hello from ICPay Cloud!",
    content_type="text/plain",
)
print("Upload result:", res)

# List files
files = client.list_files("${bucketName}", page=0, page_size=20)
print("Files:", files)`

  const envCode = `# ICPay Cloud Storage Config
IC_CANISTER_ID="${WALLET_CANISTER_ID}"
IC_BUCKET_ID="${bucketId}"
IC_BUCKET_NAME="${bucketName}"
IC_API_KEY="YOUR_API_KEY"
IC_HOST="https://icp0.io"
IC_CDN_URL="https://cloud.icpay.app"`

  const curlCode = `# Download / View file directly from global CDN
curl -O "https://cloud.icpay.app/${bucketName}/uploads/hello.txt"

# Direct on-chain Canister gateway download
curl -O "https://${WALLET_CANISTER_ID}.raw.icp0.io/cloud/${bucketName}/uploads/hello.txt"`

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
              { key: 'node', label: 'Node' },
              { key: 'python', label: 'Python' },
              { key: 'curl', label: 'cURL' },
              { key: 'env', label: '.env' },
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

        {/* Tab Contents: Node */}
        {tab === 'node' ? (
          <View className="gap-3">
            {/* Install Bar */}
            <View className="flex-row items-center justify-between rounded-2xl border border-border/70 bg-card p-3">
              <View className="flex-row items-center gap-2">
                <Icon icon={TerminalIcon} size={15} color="#888" />
                <Text className="font-mono text-xs text-foreground">{nodeInstall}</Text>
              </View>
              <Pressable
                onPress={() => void handleCopy(nodeInstall, 'install-node')}
                className="rounded-lg bg-muted px-2.5 py-1 active:opacity-70"
              >
                <Text className="text-[11px] font-medium text-foreground">
                  {copiedKey === 'install-node' ? 'Copied' : 'Copy'}
                </Text>
              </Pressable>
            </View>

            {/* Code Snippet Box */}
            <View className="rounded-2xl border border-border/70 bg-muted/40 p-3.5">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-[11px] font-medium text-muted-foreground">client.ts</Text>
                <Pressable
                  onPress={() => void handleCopy(nodeCode, 'code-node')}
                  className="flex-row items-center gap-1 rounded-md bg-card px-2 py-0.5 border border-border/60"
                >
                  <Icon
                    icon={copiedKey === 'code-node' ? Tick02Icon : Copy01Icon}
                    size={12}
                    color="#888"
                  />
                  <Text className="text-[10px] font-medium text-foreground">
                    {copiedKey === 'code-node' ? 'Copied' : 'Copy code'}
                  </Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text className="font-mono text-[11px] leading-relaxed text-foreground">
                  {nodeCode}
                </Text>
              </ScrollView>
            </View>
          </View>
        ) : null}

        {/* Tab Contents: Python */}
        {tab === 'python' ? (
          <View className="gap-3">
            {/* Install Bar */}
            <View className="flex-row items-center justify-between rounded-2xl border border-border/70 bg-card p-3">
              <View className="flex-row items-center gap-2">
                <Icon icon={TerminalIcon} size={15} color="#888" />
                <Text className="font-mono text-xs text-foreground">{pythonInstall}</Text>
              </View>
              <Pressable
                onPress={() => void handleCopy(pythonInstall, 'install-py')}
                className="rounded-lg bg-muted px-2.5 py-1 active:opacity-70"
              >
                <Text className="text-[11px] font-medium text-foreground">
                  {copiedKey === 'install-py' ? 'Copied' : 'Copy'}
                </Text>
              </Pressable>
            </View>

            {/* Code Snippet Box */}
            <View className="rounded-2xl border border-border/70 bg-muted/40 p-3.5">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-[11px] font-medium text-muted-foreground">client.py</Text>
                <Pressable
                  onPress={() => void handleCopy(pythonCode, 'code-py')}
                  className="flex-row items-center gap-1 rounded-md bg-card px-2 py-0.5 border border-border/60"
                >
                  <Icon
                    icon={copiedKey === 'code-py' ? Tick02Icon : Copy01Icon}
                    size={12}
                    color="#888"
                  />
                  <Text className="text-[10px] font-medium text-foreground">
                    {copiedKey === 'code-py' ? 'Copied' : 'Copy code'}
                  </Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text className="font-mono text-[11px] leading-relaxed text-foreground">
                  {pythonCode}
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
