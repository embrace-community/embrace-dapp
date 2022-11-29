import { Client } from "@xmtp/xmtp-js";
import { Signer } from "ethers";

import { useEffect, useState } from "react";
import { useSigner } from "wagmi";

export default function ChatMessenger({ handle }) {
  const { data: signer } = useSigner();
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const spaceConversationId = `embrace.community/${handle}`;

  const members = [
    "0xCa8454AFbC91cFfe20E726725beB264AE5Bb52FC",
    "0x725Acc62323480E9565fBbfAC8573908e4EEF883",
    "0xb64a31a65701f01a1e63844216f3dbbcc9b3cf2c",
  ]; // Need to get from contract

  const [messages, setMessages] = useState<DecodedMessage>([]);
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

    const currentAccount = await signer?.getAddress();

    // Have to send the message to all members in the space
    for (const member of members) {
      if (member.toLowerCase() !== currentAccount.toLowerCase()) {
        const canMessage = await Client.canMessage(member);

        console.log(canMessage, "canMessage", member);

        if (canMessage) {
          const conversation = await xmtpClient.conversations.newConversation(
            member,
            {
              conversationId: spaceConversationId,
              metadata: {
                space: handle,
              },
            },
          );

          console.log(
            "sending message to",
            member,
            "message:",
            messageText,
            "currentAccount",
            currentAccount,
            "conversation",
            conversation,
          );
          const result = await conversation.send(messageText);
          console.log("result", result);
        } else {
          console.log("can't message ", member);
        }
      }
    }
  }

  async function getMessages() {
    if (!xmtpClient) return;

    // Get all the conversations
    const conversations = await xmtpClient.conversations.list();
    // Filter for the ones from your application
    const myAppConversations = conversations.filter(
      (convo) =>
        convo.context?.conversationId &&
        convo.context.conversationId.startsWith(spaceConversationId),
    );

    if (myAppConversations.length > 0) {
      // Get the messages from each conversation
      const messages = await Promise.all(
        myAppConversations.map((convo) => convo.messages()),
      );

      console.log(messages[0], "messages");
      setMessages(messages[0]);
    }
  }

  return (
    <div>
      {!xmtpClient && (
        <>
          <button onClick={startChatMessenger}>Connect XMTP</button>
          <br></br>
        </>
      )}

      {xmtpClient &&
        messages.length > 0 &&
        messages.map((message) => (
          <div key={message.id}>
            <p>{message.senderAddress}</p>
            <p>rec: {message.recipientAddress}</p>
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
