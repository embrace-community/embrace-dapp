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
<img src="https://i.imgur.com/LIMblFg.jpg" alt="martin" style="height: 200px;" />
<img src="https://i.imgur.com/MKspbN4.png" alt="tobias" style="height: 200px;" />

<img src="https://i.imgur.com/Vxj7mc3.png" alt="ben" style="height: 200px;" />
</div>

Martin <martin@openskydevelopment.co.uk> (Founder)

Tobias <caruso33@web.de> (Co-Founder)

Ben <info@bennisan.be> (Design)

## Bounties

_We are applying for 10 bounties for our work during the Next Video Build Hackathon._

### Livepeer Challenge & Livepeer Best Design Challenge

<div>
<img src="https://lets.embrace.community/logos/livepeer.png" style="height: 50px;" />
</div>

_We have implemented a set of tools to enable Creators to mint NFTs for their creations and build communities around their videos, with the plan to expand to all mediums (audio, image, article). In addition to this Creators can start a Livepeer transcoded Live Stream and share the video link with their community and wherever IPFS video media is consumed we are transcoding it through LivePeer studio (e.g. Social app, Creations app, Discussions app). Please see the screenshots below and our video submission for further details._

_In terms of our design, please see our Figma links:_

[Figma Clickthrough](https://www.figma.com/proto/sEmV82YmSN96KVMeIUcuh0/Embrace.community?node-id=15%3A1107&scaling=scale-down-width&page-id=0%3A1&starting-point-node-id=9%3A646)

[Figma Design System](https://www.figma.com/file/sEmV82YmSN96KVMeIUcuh0/Embrace.community?node-id=169%3A1173&t=fsZHJ3zETYos4sEN-0)

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

_We have made use of ENS in 5 places within our app. The specific location for the ENS React component is: **/frontend/components/EnsAvatar.tsx.** Please see these screenshots:_

<div>
<img src="https://lets.embrace.community/screenshots/ens-2.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/ens-1.png" style="width: 45%;" />
</div>

<div>
<img src="https://lets.embrace.community/screenshots/ens-5.png" style="width: 45%;" />
<img src="https://lets.embrace.community/screenshots/ens-3.png" style="width: 45%;" />
</div>

### XMTP Challenge

_We have made use of XMTP for our Chat Server App and have written our own implementation of group messaging as this is not currently supported by XMTP._
_The specific location for the XMTP code is: **/frontend/components/app/chat/** & **/frontend/hooks/useXmtp.ts**_
_For more information please see the Chat Server screenshots below, along with our video submission._

<div>
<img src="https://lets.embrace.community/logos/xmtp.png" style="height: 50px;" />
</div>

### Huddle Challenge

<div>
<img src="https://lets.embrace.community/logos/huddle.png" style="height: 50px;" />
</div>

_We have used the Huddle JS Client to create a React application that uses Huddle for video calls. The specific location for all Huddle related React components is: **/frontend/components/app/chat/** & **/frontend/hooks/useHuddle.tsx**. We ran into some build errors using the SDK and so we copied over the code from the NPM repository and made the necessary changes to make it work within our Next.Js app. For more info about the video calling, please look at our Chat Server App and our video submission._

### Ceramic Challenge

<div>
<img src="https://lets.embrace.community/logos/ceramic.png" style="height: 100px;" />
</div>

_We have used Ceramic in our Discussions App which enables users to add new Discussion topics to Ceramic. The specific Ceramic related code can be found:_

- React components: **/frontend/components/app/discussions/**
- [Ceramic Models / Schemas etc](https://github.com/embrace-community/ceramic-models)
- Model Ids: **kjzl6hvfrbw6c5o8kixyadk5xegjd9obau04dcc31adirpedhq3c9xf6d6mjvi6** & **kjzl6hvfrbw6camlf39lcxw6vx4elhhbmn3wfowg2wi8nn9utu69qgyriifsif2**
- TS code: **/frontend/lib/CeramicContext.ts** & **/frontend/lib/Runtime.ts**

### IPFS Challenge

<div>
<img src="https://lets.embrace.community/logos/ipfs.png" style="height: 100px;" />
</div>

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

### Chat Server

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

## Video Submission

[Embrace dApp - stored on IPFS and transcoded through Livepeer](https://next-video.embrace.community/embrace/creations?collectionId=1&creationId=3)

[Loom (Backup)](https://www.loom.com/share/7bd16ae371e44f709b2aa61d9b08f877)

## Frontend

Build using Next.Js, React, Redux, Tailwind, Ethers.js  
[Deployed Frontend](https://next-video.embrace.community)

## Contracts

### Polgyon Mumbai

```shell
EmbraceAccounts deployed to 0xb67c789B6DaFccEfda2e6B66c4c5c72f835E96DF
EmbraceApps deployed to 0x79cf9C8De5C1c5F878366e14E4641aB2d43DA41D
EmbraceSpaces deployed to 0x7B9C2684445a119060209a97eD4F443f5884F3eB
EmbraceCreations deployed to 0x94137d87b89301D28FF1C653017fCc1baa4D1d3A
EmbraceSocials deployed to 0x9b7904bC7F024c238870d64520FD2B0385d78223
```

## Presentation & Design

[Slides](https://docs.google.com/presentation/d/1Wtra-i2t8A_XgffPHdZIZhMDywYd47lk8Ju__mpCn_c/edit?usp=sharing)

[Figma Clickthrough](https://www.figma.com/proto/sEmV82YmSN96KVMeIUcuh0/Embrace.community?node-id=15%3A1107&scaling=scale-down-width&page-id=0%3A1&starting-point-node-id=9%3A646)
