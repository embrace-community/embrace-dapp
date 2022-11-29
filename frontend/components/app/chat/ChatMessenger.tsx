import { Client, DecodedMessage } from "@xmtp/xmtp-js";
import { Signer } from "ethers";

import { useState } from "react";
import { useAccount, useSigner } from "wagmi";

export default function ChatMessenger({ handle }) {
  const { data: signer } = useSigner();
  const { address: currentAddress } = useAccount();
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const spaceConversationId = `embrace.community/${handle}/chat-test`;

  const members = [
    "0xCa8454AFbC91cFfe20E726725beB264AE5Bb52FC",
    "0x725Acc62323480E9565fBbfAC8573908e4EEF883",
    "0xB64A31a65701f01a1e63844216f3DbbCC9b3cF2C",
  ]; // Need to get from contract

  const [messages, setMessages] = useState<DecodedMessage[]>([]);
  const [messageText, setMessageText] = useState<string>("");

  async function startChatMessenger() {
    try {
      if (!signer) {
        console.log("no signer");
      }

      const xmtp = await Client.create(signer as Signer);

      setXmtpClient(xmtp);
    } catch (error) {
      console.error(error);
    }
  }

  async function sendMessage() {
    if (!xmtpClient || !signer) return;

    // Have to send the message to all members in the space
    for (const member of members) {
      let conversationId = spaceConversationId;

      if (member.toLowerCase() === (currentAddress as string).toLowerCase()) {
        conversationId = `${spaceConversationId}/${currentAddress}`;
      }
      const canMessage = await xmtpClient.canMessage(member);

      console.log(canMessage, "canMessage", member);

      if (canMessage) {
        const conversation = await xmtpClient.conversations.newConversation(
          member,
          {
            conversationId,
            metadata: {
              space: handle,
            },
          },
        );

        const result = await conversation.send(messageText);
        console.log("result", result);
      } else {
        console.log("can't message ", member);
      }
    }
  }

  async function getMessages() {
    if (!xmtpClient) return;

    // Get all the conversations
    const allConversations = await xmtpClient.conversations.list();

    // Filter the conversations to only get the ones for this space
    const appConversationsReceived = allConversations.filter(
      (convo) =>
        convo.context?.conversationId &&
        convo.context.conversationId == spaceConversationId,
    );

    // Filter the conversations again to only get the conversations that the current user sent to themselves
    // This is needed whilst there is no group messaging in XMTP, so the conversations that the current user has sent also
    // shows in the group chat
    const appConversationsSent = allConversations.filter(
      (convo) =>
        convo.context?.conversationId &&
        convo.context.conversationId ==
          `${spaceConversationId}/${currentAddress}`,
    );

    if (
      appConversationsReceived.length > 0 ||
      appConversationsSent.length > 0
    ) {
      console.log(appConversationsReceived, "appConversationsReceived");
      console.log(appConversationsSent, "appConversationsSent");
      // Merge all the messages from each conversation
      const receivedMessages = [].concat.apply(
        [],
        await Promise.all(
          appConversationsReceived.map((convo) => convo.messages() as any),
        ),
      );

      // Remove messages the current account has sent to the space chat
      const filteredReceivedMessages = receivedMessages.filter(
        (message: DecodedMessage) => message.senderAddress !== currentAddress,
      );

      // Now get all the messages the current account has sent to themselves
      const sentMessages = [].concat.apply(
        [],
        await Promise.all(
          appConversationsSent.map((convo) => convo.messages() as any),
        ),
      );

      // sort messages by order of being sent
      const chatMessages = filteredReceivedMessages
        .concat(sentMessages)
        .sort(
          (a: DecodedMessage, b: DecodedMessage) =>
            a.sent?.getTime() - b.sent?.getTime(),
        );

      console.log(chatMessages, "messages");
      setMessages(chatMessages);
    }
  }

  return (
    <div>
      {!xmtpClient && signer && (
        <>
          <button onClick={startChatMessenger}>Connect XMTP</button>
          <br></br>
        </>
      )}
      {xmtpClient &&
        messages.length > 0 &&
        messages.map((message) => (
          <div key={message.id} className="mt-5">
            <p>Sender: {message.senderAddress}</p>
            <p>{message.content}</p>
          </div>
        ))}
      {xmtpClient && <button onClick={getMessages}>Get messages</button>}
      <br></br>
      {xmtpClient && (
        <>
          <input
            type="text"
            id="message"
            onKeyUp={(e) => setMessageText(e.currentTarget.value)}
          />
          <button onClick={() => sendMessage()}>Send message</button>
        </>
      )}
    </div>
  );
}
