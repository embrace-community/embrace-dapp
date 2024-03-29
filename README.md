![embrace community](https://lets.embrace.community/logos/embrace-earth-web.png)

**How can we best express the values of community in the new era of the web?**

Today social media platforms offer a distorted expression of community that is more focused on revenue than being aligned with the true values of community. Embrace is looking to change this.
Instead of merely duplicating a Web3 version of these existing platforms, we wish to reconnect to the core principles of community and to start again with fresh eyes.

Embrace is not limited to any type of community, however the first steps are to build apps that empower Creators and enable them to build communities around their creations. As part of the Next Video Build Hackathon we have implemented 5 applications:

1.  Social: Enabling communities to create a Lens profile, publish posts which can be viewed within their community & throughout the Lens ecosystem
2.  Creations: Enabling creators to add their content (e.g videos) to be stored on IPFS, minted as NFTs & transcoded through LivePeer
3.  Chat Server: The first stages of a Decentralised Chat Server, using XMTP for chat & Huddle for video calling
4.  Live Stream: Start a stream through LiverPeer & share the link with your community on Lens
5.  Discussions: A forum built using Ceramic

## Team

<div style="display: flex; justify-content: space-between;">
<img src="https://lets.embrace.community/team/martin.jpeg" alt="martin" style="height: 200px;" />
<img src="https://lets.embrace.community/team/tobias.png" alt="tobias" style="height: 200px;" />
</div>

Martin <martin@openskydevelopment.co.uk> (Founder)

Tobias <caruso33@web.de> (Co-Founder)

## Bounties

_We are applying for 10 bounties for our work during the Next Video Build Hackathon._

### Livepeer Challenge & Livepeer Best Design Challenge

<div>
<img src="https://lets.embrace.community/logos/livepeer.png" style="height: 50px;" />
</div>

_We have implemented a set of tools to enable Creators to mint NFTs for their creations and build communities around their videos, with the plan to expand to all mediums (audio, image, article). In addition to this Creators can start a Livepeer transcoded Live Stream and share the video link with their community and wherever IPFS video media is consumed we are transcoding it through LivePeer studio (e.g. Social app, Creations app, Discussions app). Please see the screenshots below and our video submission for further details._

### Polygon: Most innovative video hack on polygon & Polygon: Best video or creator tool on Polygon

<div>
<img src="https://lets.embrace.community/logos/polygon.png" style="height: 50px;" />
</div>

_We have deployed our contracts to Polygon Mumbai and plan to use Polygon as our primary blockchain for our app. We have implemented a set of tools to enable Creators to mint NFTs for their creations and build communities around their videos, with the plan to expand to all mediums (audio, image, article). Creators can share their content through Lens, start a Live Stream with their community & enable members to communicate through the Chat Server and video calling. Please see the screenshots below and our video submission for further details._

### Lens Challenge

<div>
<img src="https://lets.embrace.community/logos/lens.svg" style="height: 100px;" />
</div>

_We have developed 5 applications to enable Creators to build a community around their NFT creations, and the Lens / Social App is the first application members see whan accessing a community. We support the creation of Lens profiles, setting a default profile, linking a profile to our Social app, displaying Lens published posts, adding Lens posts. The Lens app can easily integrate with the other apps, such as sharing a Live Stream link or linking to a new NFT Creation. Please see screenshots of the Social App below, and our video submission._

_The specific location for all Lens related React components is: **/frontend/components/app/social/**_

### ENS Challenge

<div>
<img src="https://lets.embrace.community/logos/ens.png" style="height: 50px;" />
</div>

_We have made use of ENS in 5 places within our app, however the ENS domains & avatars will only load when we use the Goerli network (where our contracts are also deployed). The specific location for the ENS React component is: **/frontend/components/EnsAvatar.tsx.** Please see below for the Goerli network screenshots:_

<div>
<img src="https://lets.embrace.community/screenshots/ens-2.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/ens-1.png" style="width: 45%;" />
</div>

<div>
<img src="https://lets.embrace.community/screenshots/ens-5.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/ens-3.png" style="width: 45%;" />
</div>

### XMTP Challenge

<div>
<img src="https://lets.embrace.community/logos/xmtp.png" style="height: 50px;" />
</div>

_We have made use of XMTP for our Chat Server App and have written our own implementation of group messaging as this is not currently supported by XMTP._
_The specific location for the XMTP code is: **/frontend/components/app/chat/** & **/frontend/hooks/useXmtp.ts**_
_For more information please see the Chat Server screenshots below, along with our video submission._

### Huddle Challenge

<div>
<img src="https://lets.embrace.community/logos/huddle.png" style="height: 50px;" />
</div>

_We have used the Huddle JS Client to create a Chat Server app that uses Huddle for video calls. The specific location for all Huddle related code is: **/frontend/components/app/chat/** & **/frontend/hooks/useHuddle.tsx**. We ran into some build errors using the JS SDK and so we copied over the code from the NPM repository and made the necessary changes to make it work within our Next.Js app. For more info about the video calling, please look at our Chat Server App screenshots and our video submission._

### Ceramic Challenge

<div>
<img src="https://lets.embrace.community/logos/ceramic.png" style="height: 100px;" />
</div>

_We have used Ceramic in our Discussions App which enables users to add new Discussion topics to Ceramic. When viewing a Discussion we parse any IPFS video and play it through the Livepeer.js player and Livepeer studio (Syntax is: VIDEO:[url]). For more information please look at the screenshots for the Discussions App below and also our video submission. The specific Ceramic related code can be found:_

- [Ceramic Models / Schemas Repo](https://github.com/embrace-community/ceramic-models)
- React components: **/frontend/components/app/discussions/**
- Model Ids: **kjzl6hvfrbw6c5o8kixyadk5xegjd9obau04dcc31adirpedhq3c9xf6d6mjvi6** & **kjzl6hvfrbw6camlf39lcxw6vx4elhhbmn3wfowg2wi8nn9utu69qgyriifsif2**
- TS code: **/frontend/lib/CeramicContext.ts** & **/frontend/lib/Runtime.ts**

### IPFS Challenge

<div>
<img src="https://lets.embrace.community/logos/ipfs.png" style="height: 100px;" />
<img src="https://lets.embrace.community/logos/web3storage.png" style="height: 100px;" />
</div>

_IPFS and Web3.Storage plays a significant role in the Embrace Community app as we use it to store all metadata related to communities & NFTs, along with any videos / images uploaded to the platform. For more info please watch our video submission._

## Screenshots

### Community Spaces

<div>
<img src="https://lets.embrace.community/screenshots/spaces-1.png" style="width: 45%;" />
</div>

### Create a Space

<div>
<img src="https://lets.embrace.community/screenshots/create-1.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/create-2.png" style="width: 45%;" />
</div>
<div>
<img src="https://lets.embrace.community/screenshots/create-3.png" style="width: 45%;" />
</div>

### Apps

### Social App

_Using Lens Protocol and Livepeer for transcoding video media files_

<div>
<img src="https://lets.embrace.community/screenshots/social-1.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/social-2.png" style="width: 45%;" />
</div>
<div>
<img src="https://lets.embrace.community/screenshots/social-3.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/social-4.png" style="width: 45%;" />
</div>

### Creations App

_Using IPFS for media storage and Livepeer.js + Livepeer Studio for transcoding_

<div>
<img src="https://lets.embrace.community/screenshots/creations-1.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/creations-2.png" style="width: 45%;" />
</div>
<div>
<img src="https://lets.embrace.community/screenshots/creations-3.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/creations-4.png" style="width: 45%;" />
</div>

### Chat Server App

_Using XMTP for chat and Huddle for video calls_

<div>
<img src="https://lets.embrace.community/screenshots/chat-1.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/chat-2.png" style="width: 45%;" />
</div>

### Live Streaming App

_Live Streaming through WebRTC and Livepeer.js + Livepeer Studio_

<div>
<img src="https://lets.embrace.community/screenshots/stream-1.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/stream-2.png" style="width: 45%;" />
</div>

### Discussions App

_Discussions App with topics saved through Ceramic and videos transcoded through Livepeer._

<div>
<img src="https://lets.embrace.community/screenshots/discussions-2.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/discussions-4.png" style="width: 45%;" />
</div>

<div>
<img src="https://lets.embrace.community/screenshots/discussions-5.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/discussions-1.png" style="width: 45%;" />
</div>

<div>
<img src="https://lets.embrace.community/screenshots/discussions-3.png" style="width: 45%;" />
</div>

## Video Submission

[Embrace dApp - stored on IPFS and transcoded through Livepeer](https://next-video.embrace.community/embrace/creations?collectionId=1&creationId=3)

[Loom (Backup)](https://www.loom.com/share/632338dcde7b4483b4925ac2c665454b)

## Frontend

Build using Next.Js, React, Redux, Tailwind, Ethers.js  
[Deployed Frontend](https://next-video.embrace.community)

## Contracts

### Polgyon Mumbai

```shell
EmbraceAccounts deployed to 0xda2FF59601995eEc05f63207DC39e40108c4c083
EmbraceApps deployed to 0xeaDcb5201D6C4c029b2aa86F496Cc437ea3F2Fe1
EmbraceSpaces deployed to 0x68778B3b14d10410e45736DF08f13E4690f2E65a
EmbraceCreations deployed to 0xB3d3F26F0E3B8644e6e59a473CFB456a74Bc7932
EmbraceSocial deployed to 0xBAA5F5081a484199b7e5Cc3412168cd9CD86248e
```

### Goerli

```shell
EmbraceAccounts deployed to 0xAb350A088D4A5548f5EE941D32F2DAece19716Da
EmbraceApps deployed to 0x9cd0308a5026fA24A594D7088Df60e4e1aE54057
EmbraceSpaces deployed to 0x30badBDd97B099Df36CB9f1C170f088453b4e5F6
EmbraceCreations deployed to 0x3F7aBF527Aa791D5CAc54E0eE17F6CDa4a2C0075
EmbraceSocial deployed to 0xE399049a9a6567Ae5153D508aeDa51f2770AaC1b
```

## Presentation

[Slides](https://docs.google.com/presentation/d/1Wtra-i2t8A_XgffPHdZIZhMDywYd47lk8Ju__mpCn_c/edit?usp=sharing)
