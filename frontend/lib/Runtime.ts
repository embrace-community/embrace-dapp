// This is an auto-generated file, do not edit manually
import type { RuntimeCompositeDefinition } from "@composedb/types";
export const definition: RuntimeCompositeDefinition = {
  models: {
    DiscussionTopic: {
      id: "kjzl6hvfrbw6c76kvqxy53q10bxymmyfzrjy2v4vb153eg8yz0r9vyyu6gfnvwg",
      accountRelation: { type: "list" },
    },
    DiscussionTopicComment: {
      id: "kjzl6hvfrbw6c95thytuxisa92hyhzbnyoert80dz2m4j85eiq79iqer4c4jss1",
      accountRelation: { type: "list" },
    },
  },
  objects: {
    DiscussionTopicLitEncryption: {
      accessConditions: { type: "string", required: true },
      encryptedSymmetricKey: { type: "string", required: true },
    },
    DiscussionTopic: {
      title: { type: "string", required: true },
      author: { type: "did", required: false },
      address: { type: "string", required: true },
      content: { type: "string", required: true },
      spaceId: { type: "integer", required: true },
      litencryption: {
        type: "reference",
        refType: "object",
        refName: "DiscussionTopicLitEncryption",
        required: false,
      },
    },
    DiscussionTopicCommentLitEncryption: {
      accessConditions: { type: "string", required: true },
      encryptedSymmetricKey: { type: "string", required: true },
    },
    DiscussionTopicComment: {
      author: { type: "did", required: false },
      address: { type: "string", required: true },
      content: { type: "string", required: true },
      spaceId: { type: "integer", required: true },
      litencryption: {
        type: "reference",
        refType: "object",
        refName: "DiscussionTopicCommentLitEncryption",
        required: false,
      },
      discussionTopicId: { type: "streamid", required: true },
      discussionTopic: {
        type: "view",
        viewType: "relation",
        relation: {
          source: "document",
          model:
            "kjzl6hvfrbw6c76kvqxy53q10bxymmyfzrjy2v4vb153eg8yz0r9vyyu6gfnvwg",
          property: "discussionTopicId",
        },
      },
    },
  },
  enums: {},
  accountData: {
    discussionTopicList: { type: "connection", name: "DiscussionTopic" },
    discussionTopicCommentList: {
      type: "connection",
      name: "DiscussionTopicComment",
    },
  },
};
