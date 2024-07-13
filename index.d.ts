/// <reference types="node" />

declare module '@luc4sguilherme/steam-community' {
  import type SteamID from 'steamid';
  import type EventEmitter from 'events';
  import { Request } from 'request';

  interface Groups {
    getGroupMembers(
      gid: gid,
      callback: (err: CallbackError, members: SteamID[]) => any,
    ): any;

    getGroupMembersEx(gid: gid, addresses: any[], callback: Callback): void;

    joinGroup(gid: gid, callback: Callback): void;

    leaveGroup(gid: gid, callback: Callback): void;

    getAllGroupAnnouncements(gid: gid, time: Date, callback: Callback): any;

    postGroupAnnouncement(
      gid: gid,
      headline: string,
      content: string,
      hidden: boolean,
      callback: Callback,
    ): void;

    editGroupAnnouncement(
      gid: gid,
      aid: any,
      headline: string,
      content: string,
      callback: Callback,
    ): void;

    deleteGroupAnnouncement(gid: gid, aid: any, callback: Callback): void;

    scheduleGroupEvent(
      gid: gid,
      name: any,
      type: any,
      description: string,
      time: Date,
      server: any,
      callback: Callback,
    ): void;

    editGroupEvent(
      gid: gid,
      id: any,
      name: string,
      type: any,
      description: string,
      time: Date,
      server: any,
      callback: Callback,
    ): void;

    deleteGroupEvent(gid: gid, id: any, callback: Callback): void;

    setGroupPlayerOfTheWeek(
      gid: gid,
      steamID: SteamID | string,
      callback: Callback,
    ): void;

    kickGroupMember(
      gid: gid,
      steamID: SteamID | string,
      callback: Callback,
    ): void;

    getGroupHistory(gid: gid, page: number, callback: Callback): void;

    getAllGroupComments(
      gid: gid,
      from: number,
      count: number,
      callback: Callback,
    ): void;

    deleteGroupComment(gid: gid, cid: cid, callback: Callback): void;

    postGroupComment(gid: gid, message: string, callback: Callback): void;

    /**
     * Get requests to join a restricted group.
     * @param gid - The SteamID of the group you want to manage
     * @param callback - First argument is null/Error, second is array of SteamID objects
     */
    getGroupJoinRequests(gid: gid, callback: Callback): void;

    /**
     * Respond to one or more join requests to a restricted group.
     * @param gid - The SteamID of the group you want to manage
     * @param steamIDs - The SteamIDs of the users you want to approve or deny membership for (or a single value)
     * @param approve - True to put them in the group, false to deny their membership
     * @param callback - Takes only an Error object/null as the first argument
     */
    respondToGroupJoinRequests(
      gid: gid,
      steamIDs: SteamID | string | SteamID[] | string[],
      approve: boolean,
      callback: Callback,
    ): void;

    /**
     * Respond to *ALL* pending group-join requests for a particular group.
     * @param gid - The SteamID of the group you want to manage
     * @param approve - True to allow everyone who requested into the group, false to not
     * @param callback - Takes only an Error object/null as the first argument
     */
    respondToAllGroupJoinRequests(
      gid: gid,
      approve: boolean,
      callback: Callback,
    ): void;
  }

  interface WebApi {
    /**
     * Retrieves your account's Web API key, and registers one if needed. Usage of this method constitutes agreement to the Steam Web API terms of use.
     *
     * @param domain A domain name to associate with your key.
     * @param callback A function to be called once the key is obtained.
     */
    getWebApiKey(
      domain: string,
      callback: (
        /** If an error occurred, this is an Error object. The message property will be Access Denied if you attempt to retrieve an API key on a limited account. */
        err: CallbackError,
        /** Your API key on success. */
        key: string,
      ) => any,
    ): any;
  }

  interface Helpers {
    isSteamID(input: any): boolean;

    decodeSteamTime(time: string): Date;

    /**
     * Get an Error object for a particular EResult
     * @param eresult
     * @returns null|Error
     */
    eresultError(eresult: EResult): null | Error;
  }

  interface Users {
    /**
     * Adds the user as a friend.
     *
     * @param userID
     * @param callback
     */
    addFriend(userID: userid, callback: Callback): void;

    /**
     * Accepts a pending friend request from this user.
     *
     * @param userID
     * @param callback
     */
    acceptFriendRequest(userID: userid, callback: Callback): void;

    /**
     * Removes the user from your friends list.
     *
     * @param userID
     * @param callback Optional.
     */
    removeFriend(userID: userid, callback?: Callback): void;

    /**
     * Blocks all communication with the user.
     *
     * @param userID
     * @param callback
     */
    blockCommunication(userID: userid, callback: Callback): void;

    /**
     * Removes the user from your blocked list.
     *
     * @param userID
     * @param callback Optional.
     */
    unblockCommunication(userID: userid, callback?: Callback): void;

    postUserComment(userID: userid, message: string, callback: Callback): void;

    deleteUserComment(userID: userid, commentID: any, callback: Callback): void;

    getUserComments(
      userID: userid,
      options: { start?: number; count?: number },
      callback: (err: Error | null, comments: UserComment[]) => void,
    ): any;

    getUserComments(
      userID: userid,
      callback: (err: Error | null, comments: UserComment[]) => void,
    ): any;

    inviteUserToGroup(userID: userid, groupID: any, callback: Callback): void;

    getUserAliases(userID: userid, callback: Callback): any;

    getUserProfileBackground(userID: userid, callback: Callback): void;

    /**
     * Upload an image to Steam and send it to another user over Steam chat.
     * @param userID - Either a SteamID object or a string that can parse into one
     * @param imageContentsBuffer - The image contents, as a Buffer
     * @param [options]
     * @param callback
     */
    sendImageToUser(
      userID: userid,
      imageContentsBuffer: Buffer,
      options: any,
      callback: Callback,
    ): void;

    /**
     * Check if you have permission to comment on a profile
     * @param userID - Either a SteamID object or a string that can parse into one
     * @param callback
     */
    getCommentPrivacy(
      userID: userid,
      callback: (
        err: Error | null,
        commentPrivacy: 'Private' | 'Public',
      ) => void,
    ): void;
  }

  interface TwoFactor {
    /**
     * Starts the process to turn on TOTP for your account. You must have a phone number already linked with and verified on your account.
     *
     * @param callback Called when the request completes.
     */
    enableTwoFactor(
      callback: (
        err: CallbackError,
        /** The entire response from Steam. */
        response: {
          /** A value from EResult. If this is not OK (1), then the request failed. */
          status: EResult;
          /** This is your secret that's used for two-factor authentication. */
          shared_secret: string;
          /** This is your secret that's used for confirming trades. */
          identity_secret: string;
          /** You will need this in the future to disable two-factor authentication. */
          revocation_code: string;
        },
      ) => any,
    ): void;

    /**
     * Finishes the process of enabling TOTP two-factor authentication for your account. You can use steam-totp in the future when logging on to get a code.
     *
     * @param secret
     * @param activationCode
     * @param callback
     */
    finalizeTwoFactor(
      secret: Buffer | string,
      activationCode: string,
      callback: Callback,
    ): void;

    /**
     * Disables two-factor authentication on your account given a revocation code.
     * Unlike the revocation procedure on the support site, this will not invalidate all your account's outstanding Steam Guard authorizations.
     *
     * @param revocationCode Your two-factor revocation code, which has the format Rxxxxx, where x is a number.
     * @param callback Called when the request completes.
     */
    disableTwoFactor(revocationCode: string, callback: Callback): void;
  }

  interface Profile {
    /**
     * If your Steam account is new and your profile isn't set up yet, you can call this to create it.
     *
     * @param callback Called when the action is complete.
     */
    setupProfile(callback: Callback): void;

    /**
     * Updates one or more parts of your profile.
     *
     * @param settings
     * @param callback
     */
    editProfile(settings: EditProfileSettings, callback: Callback): void;

    /**
     * Updates one or more parts of your profile settings.
     *
     * @param settings An profile settings object.
     * @param callback Optional. Called when the request completes.
     */
    profileSettings(settings: ProfileSetting, callback: Callback): void;

    /**
     * Replaces your current avatar image with a new one.
     *
     * @param image A `Buffer` containing the image, a string containing a URL to the image, or a string containing the path to the image on the local disk.
     * @param format Optional. The format of the image.
     * Is required if `image` is a `Buffer`, else it will be detected from the `Content-Type` header (if `image` is a URL) or the file extension (if `image` is a local path).
     * If provided, `format` should be one of `jpg` (or `jpeg`), `gif`, or `png`. These are the only supported image formats.
     * @param callback Optional. Called when the upload is complete or fails.
     */
    uploadAvatar(
      image: Buffer | string,
      format: ImageFormat,
      callback: (
        err: CallbackError,
        /** The URL to the new image on Steam's CDN. */
        url: string,
      ) => any,
    ): void;

    /**
     * Posts a status update to your profile feed.
     *
     * @param statusText A string containing your new status update's content (can contain BBCode and emoticons).
     * @param options Optional. Can be omitted if no options are desired. An object containing zero or more of properties.
     * @param callback Required. Called when request completes.
     */
    postProfileStatus(
      statusText: any,
      options: {
        /** An integer appID if you want this status update to be tagged with a specific game. */
        appID: appid;
      },
      callback: (
        err: CallbackError,
        /** The ID of this new post. */
        postID: any,
      ) => any,
    ): void;

    /**
     * Delete a previously-posted profile status update.
     * @param postID
     * @param [callback]
     */
    deleteProfileStatus(postID: number, callback: Callback): void;
  }

  interface Market {
    /**
     * Requests a list of all apps which support the Steam Community Market (this list is scraped from the app buttons on the right side of the market home page).
     *
     * @param callback Called when the requested data is available.
     */
    getMarketApps(
      callback: (
        err: CallbackError,

        apps: object,
      ) => any,
    ): void;

    /**
     * Check if an item is eligible to be turned into gems and if so, get its gem value.
     * Note that the AppID you need to provide is the AppID of the game to which the item belongs, not 753 (which is the AppID to which Steam Community items actually belong).
     *
     * @param appid
     * @param assetid
     * @param callback
     */
    getGemValue(
      appid: appid,
      assetid: assetid,
      callback: (
        err: CallbackError,
        res: {
          promptTitle: string;

          gemValue: number;
        },
      ) => any,
    ): void;

    /**
     * Turn an eligible item into gems.
     * @param appid
     * @param assetid
     * @param expectedGemsValue
     * @param callback
     */
    turnItemIntoGems(
      appid: appid,
      assetid: assetid,
      expectedGemsValue: number,
      callback: (
        err: CallbackError,
        res: {
          gemsReceived: number;

          totalGems: number;
        },
      ) => any,
    ): void;

    /**
     * Unpacks a booster pack in your inventory.
     *
     * @param appid The AppID of the game to which the booster pack in question belongs.
     * @param assetid The AssetID of the booster pack in question.
     * @param callback A function to be called when the request completes.
     */
    openBoosterPack(
      appid: appid,
      assetid: assetid,
      callback: (
        err: CallbackError,
        items: Array<{
          image: string;
          name: string;
          series: any;
          foil: boolean;
        }>,
      ) => any,
    ): void;

    /**
     * Get details about a gift in your Steam Gifts inventory.
     *
     * @param giftID A string containing the assetid of the gift in your inventory.
     * @param callback A function to be called when the requested data is available
     */
    getGiftDetails(
      giftID: string,
      callback: (
        err: CallbackError,
        res: {
          giftName: string;

          packageID: any;

          owned: boolean;
        },
      ) => any,
    ): void;

    /**
     * Redeem a gift in your Steam Gifts inventory and add it to your library.
     *
     * @param giftID A string containing the assetid of the gift in your inventory.
     * @param callback A function to be called when the request completes.
     */
    redeemGift(giftID: string, callback: Callback): void;

    /**
     * Packs some gems into sacks. If you have multiple gem stacks in your inventory, this can only be used to pack one stack at a time.
     * If you have multiple sack stacks in your inventory, there is no way to specify which stack the newly-acquired stacks should be added to.
     *
     * @param assetid - ID of gem stack you want to pack into sacks
     * @param desiredSackCount - How many sacks you want. You must have at least this amount * 1000 gems in the stack you're packing
     * @param callback A function to be called when the request completes.
     */
    packGemSacks(
      assetid: assetid,
      desiredSackCount: number,
      callback: Callback,
    ): void;

    /**
     * Unpacks some sacks of gems. You will receive 1000 gems for eaach sack you unpack.
     * If you have multiple gem stacks in your inventory, there is no way to specify which stack newly-acquired gems should be added to.
     * @param assetid - ID of sack stack you want to unpack (say that 5 times fast).
     * @param sacksToUnpack How many sacks in the stack you want to unpack.
     * @param callback A function to be called when the request completes.
     */
    unpackGemSacks(
      assetid: assetid,
      sacksToUnpack: number,
      callback: Callback,
    ): void;
  }

  interface Http {
    /**
     * All arguments are optional, but you need one of uri and options. If uri isn't provided, then either options.uri or options.url must be defined with the request URI.
     * The options object will be passed to the request module (if provided). If you don't specify a method in options, then it will default to GET.
     *
     * @param uri Optional. A string containing the request URI.
     * @param options Optional. An object containing request options (this object will be passed to the request module).
     * @param callback Optional. Called when the request completes.
     * @param source Optional (but highly encouraged). A string which is passed to hooks as the source value.
     * @param args
     */
    httpRequest(
      uri?: string,
      options?: any,
      callback?: Callback,
      source?: string,
      ...args: any[]
    ): void;

    /**
     * Convenience method which performs a GET request.
     * @param args
     */
    httpRequestGet(...args: any[]): any;

    /**
     * Convenience method which performs a POST request.
     * @param args
     */
    httpRequestPost(...args: any[]): any;
  }

  interface Help {
    /**
     * Restore a previously removed steam package from your steam account.
     * @param packageID
     * @param callback
     */
    restorePackage(packageID: packageid, callback: Callback): void;

    /**
     * Removes a license from your account. The help site claims this is "permanent", but it can be undone via a call to restorePackage.
     * @param packageID
     * @param callback
     */
    removePackage(packageID: packageid, callback: Callback): void;
  }

  interface Confirmations {
    /**
     * Get a list of your account's currently outstanding confirmations.
     * @param time - The unix timestamp with which the following key was generated
     * @param key - The confirmation key that was generated using the preceeding time and the tag "conf" (this key can be reused)
     * @param callback - Called when the list of confirmations is received
     */
    getConfirmations(
      time: number,
      key: string,
      callback: (err: CallbackError, confirmations: CConfirmation[]) => any,
    ): void;

    /**
     * Get the trade offer ID associated with a particular confirmation
     * @param confID - The ID of the confirmation in question
     * @param time - The unix timestamp with which the following key was generated
     * @param key - The confirmation key that was generated using the preceeding time and the tag "details" (this key can be reused)
     * @param callback
     */
    getConfirmationOfferID(
      confID: number,
      time: number,
      key: string,
      callback: Callback,
    ): void;

    /**
     * Confirm or cancel a given confirmation.
     * @param confID - The ID of the confirmation in question, or an array of confirmation IDs
     * @param confKey - The confirmation key associated with the confirmation in question (or an array of them) (not a TOTP key, the `key` property of CConfirmation)
     * @param time - The unix timestamp with which the following key was generated
     * @param key - The confirmation key that was generated using the preceding time and the tag "allow" (if accepting) or "cancel" (if not accepting)
     * @param accept - true if you want to accept the confirmation, false if you want to cancel it
     * @param callback - Called when the request is complete
     */
    respondToConfirmation(
      confID: number | number[],
      confKey: string | string[],
      time: number,
      key: string,
      accept: boolean,
      callback: Callback,
    ): void;

    /**
     * Accept a confirmation for a given object (trade offer or market listing) automatically.
     * @param identitySecret
     * @param objectID
     * @param callback
     */
    acceptConfirmationForObject(
      identitySecret: Buffer | string | null,
      objectID: any,
      callback: Callback,
    ): any;

    /**
     * Send a single request to Steam to accept all outstanding confirmations (after loading the list). If one fails, the
     * entire request will fail and there will be no way to know which failed without loading the list again.
     * @param time
     * @param confKey
     * @param allowKey
     * @param callback
     */
    acceptAllConfirmations(
      time: number,
      confKey: string,
      allowKey: string,
      callback: Callback,
    ): any;

    /**
     * Start automatically polling our confirmations for new ones. The `confKeyNeeded` event will be emitted when we need a confirmation key, or `newConfirmation` when we get a new confirmation
     * @param pollInterval - The interval, in milliseconds, at which we will poll for confirmations. This should probably be at least 10,000 to avoid rate-limits.
     * @param [identitySecret=null] - Your identity_secret. If passed, all confirmations will be automatically accepted and nothing will be emitted.
     */
    startConfirmationChecker(
      pollInterval: number,
      identitySecret?: Buffer | string | null,
    ): void;

    /**
     * Stop automatic polling. If you set your `identitySecret` previously, this will delete it.
     */
    stopConfirmationChecker(): void;

    /**
     * Run the confirmation checker right now instead of waiting for the next poll.
     * Useful to call right after you send/accept an offer that needs confirmation.
     */
    checkConfirmations(): any;
  }

  class CConfirmation {
    constructor(community: any, data: object);

    /** The ID of this confirmation. This is not the same as a trade offer ID. */
    id: any;
    /** What type of thing this confirmation wants to confirm. The enum is available as a property of  */
    type: ConfirmationType;
    /** The ID of the thing that created this confirmation (trade offer ID for a trade, market listing ID for a market listing). */
    creator: string;
    /** The key for this confirmation. This is required when confirming or canceling the confirmation. This is not the same as the TOTP confirmation key. */
    key: string;
    /** The title of this confirmation. */
    title: string;
    /**
     * A textual description of what you will receive from this confirmation, if this is a trade.
     * If this is a market listing, then this is a string containing the list price and then the amount you will receive parenthetically.
     * For example: $115.00 ($100.00)
     */
    receiving: string;
    /** A textual description of when this confirmation was created. */
    time: string;
    /** The URL to your trading partner's avatar, if this is a trade. The URL to the image of the item, if this is a market listing. Otherwise, an empty string. */
    icon: string;
    offerID: string | null;

    /**
     * Gets the ID of the trade offer that this confirmation is confirming, if it's for a trade.
     *
     * @param time The Unix timestamp with which the following key was generated.
     * @param key The confirmation key that was generated using the preceeding time and the tag "details" (this key can be reused). You can use steam-totp to generate this.
     * @param callback Called when the request completes.
     */
    getOfferID(time: any, key: any, callback: any): void;

    /**
     * Accept or decline the confirmation.
     *
     * @param time The Unix timestamp with which the following key was generated.
     * @param key The confirmation key that was generated using the preceeding time and the tag "allow" (if accepting) or "cancel" (if declining). You can use steam-totp to generate this..
     * @param accept `true` if you are accepting, `false` if you are canceling.
     * @param callback
     */
    respond(time: any, key: any, accept: boolean, callback: Callback): void;
  }

  class CEconItem {
    /** The item's unique ID within its app+context. */
    id: string;

    /** The item's unique ID within its app+context. */
    assetid: string;

    /** The ID of the context within the app in which the item resides. */
    contextid: string;
    currencyid: string;

    /** The ID of the app which owns the item. */
    appid: number;

    /** The first half of the item cache identifier. The classid is enough to get you basic details about the item. */
    classid: string;

    /** The second half of the item cache identifier. */
    instanceid: string;

    /** How much of this item is in this stack. */
    amount: number;

    /**
     * The item's position within the inventory (starting at 1). Not defined if this item wasn't retrieved directly
     * from an inventory (e.g. from a trade offer or inventory history).
     */
    pos: number;

    /** The item's display name. */
    name: string;

    market_fee_app: number;

    /** The item's universal market name. This identifies the item's market listing page. */
    market_hash_name: string;

    /** The render color of the item's name, in hexadecimal. */
    name_color: string;

    /** The displayed background color, in hexadecimal. */
    background_color: string;

    /** The "type" that's shown under the game name to the right of the game icon. */
    type: string;

    /** `true` if the item can be traded, `false` if not. */
    tradable: boolean;

    /** `true` if the item can be listed on the Steam Community Market, `false` if not. */
    marketable: boolean;

    /** `true` if, on the Steam Community Market, this item will use buy orders. `false` if not. */
    commodity: boolean;

    /** How many days for which the item will be untradable after being sold on the market. */
    market_tradable_restriction: number;

    /** How many days for which the item will be unmarketable after being sold on the market. */
    market_marketable_restriction: number;

    /** An array of objects containing information about the item. Displayed under the item's `type`. */
    descriptions: CEconItemDescription[];
    owner_descriptions: CEconItemDescription[];
    actions: CEconItemAction[];
    owner_actions: CEconItemAction[];
    market_actions: any[];

    /**
     * An array of strings containing "fraud warnings" about the item. In inventories and trades, items with fraud
     * warnings have a red (!) symbol, and fraud warnings are displayed in red under the item's name.
     */
    fraudwarnings: string[];

    /** An array of objects containing the item's inventory tags. */
    tags: Tag[];

    /** Not always present. An object containing arbitrary data as reported by the game's item server. */
    app_data?: any;

    /**
     * Returns a URL where this item's image can be downloaded. You can optionally append a size as such:
     *
     * ```js
     * var url = item.getImageURL() + '128x128';
     * ```
     */
    getImageURL(): string;

    /** Returns a URL where this item's image can be downloaded. */
    getLargeImageURL(): string;

    /**
     * Returns a specific tag from the item, or `null` if it doesn't exist.
     *
     * @param category - A string containing the tag's category (the `category` property of the tag object).
     */
    getTag(category: string): Tag | null;
  }

  class CMarketItem {
    constructor(appid: any, hashName: any, community: any, body: any, $: any);

    /** `true` if this is a commodity item (buy/sell orders) or `false` otherwise. */
    commodity: boolean;
    /** If this is a commodity item, this will be the item's commodity ID. Not defined otherwise. */
    commodityID: number;
    medianSalePrices: Array<{
      /** A Date object representing the hour that this object contains data for. */
      hour: Date;
      /** The median price at which this item was sold during this hour (as a float). */
      price: number;
      /** The amount of this item which was sold during this hour. */
      quantity: number;
    }>;
    firstAsset: any;
    assets: any;
    /** How many copies of this item are currently available on the market. */
    quantity: number;
    /** The lowest price at which this item is sold, in cents. */
    lowestPrice: number;

    /**
     * If this is a commodity item, you can call this to fetch the latest prices.
     * If not a commodity, this will throw an Error. Once complete, quantity, lowestPrice, buyQuantity, and highestBuyOrder will be updated.
     *
     * @param currency
     * @param callback Optional. Fired when the data is updated.
     */
    updatePrice(currency: string, callback?: any): void;
  }

  class CMarketSearchResult {
    constructor(row: any);

    /** The AppID of the game to which this item belongs. */
    appid: appid;
    /** The market_hash_name of the item, otherwise known as the English version of the item's name on the market. */
    market_hash_name: string;
    /** A URL to a 512x512 image of this item. You can get custom sizes by simply appending your desired size to this URL. For example, to get a 64x64 image, just use item.image + '64x64'. */
    image: string;
    /** The lowest price of this item on the market, in the lowest denomination of your currency (e.g. USD cents). */
    price: number;
    /** How many of this item there are currently listed on the market. */
    quantity: number;
  }

  class CSteamGroup {
    constructor(community: any, groupData: any);

    /** A SteamID object containing the group's SteamID. Visit a group at {@link https://steamcommunity.com/gid/SteamID}. */
    steamID: SteamID;
    /** The group's name (cannot be changed). */
    name: string;
    /** The group's URL (this can be changed). Visit a group at {@link https://steamcommunity.com/groups/GROUPURL}. */
    url: string;
    /** The group's headline (this can be changed). */
    headline: string;
    /** The group's summary content (this can be changed). */
    summary: string;
    /** The hash of the group's avatar. */
    avatarHash: string;
    /** How many members the group had when getSteamGroup was called. */
    members: number;
    /** How many group members were in group chat when getSteamGroup was called. */
    membersInChat: number;
    /** How many group members were in-game when getSteamGroup was called. */
    membersInGame: number;
    /** How many group members were online on Steam when getSteamGroup was called. */
    membersOnline: number;

    /**
     * Returns a URL where you can download this group's avatar.
     *
     * @param size What size to get the avatar at. Possible values are full, medium, or empty (small). Default empty.
     * @param protocol The protocol to use. Possible values for protocol are http://, https://, or
     * @returns string
     */
    getAvatarURL(
      size: string,
      protocol: 'http://' | 'https://' | string,
    ): string;

    /**
     * Retrieves a list of all users in this group. For large groups this could take around 30 seconds, possibly longer.
     *
     * @param addresses Optional. An array of IP addresses (in x.x.x.x format) that will be rotated between when paging through the results. See below for details.
     * @param callback Called when the member list is available.
     */
    getMembers(
      addresses: string[],
      callback: (err: CallbackError, memebers: SteamID[]) => any,
    ): void;

    /**
     * Joins a group. If the group is restricted, requests to join.
     *
     * @param callback Called when the request completes.
     */
    join(callback: Callback): void;

    /**
     * Leaves a group.
     *
     * @param callback Called when the request completes.
     */
    leave(callback: Callback): void;

    /**
     * Gets all announcements posted to the group.
     *
     * @param time Optional. A Date object. If specified, only announcements posted after this time are returned.
     * @param callback Called when requested data is available.
     */
    getAllAnnouncements(
      time: Date | null,
      callback: (
        err: CallbackError,
        /** An array of announcement objects. */
        announcements: Announcement[],
      ) => any,
    ): void;

    /**
     * Posts an announcement to a group, provided you have permission to do so.
     *
     * @param headline The title of the announcement.
     * @param content What the announcement says.
     * @param hidden Optional. `true` to post this as a hidden announcement. Default `false`.
     * @param callback Called when the request completes.
     */
    postAnnouncement(
      headline: any,
      content: any,
      hidden: boolean,
      callback: Callback,
    ): void;

    /**
     * Edits an announcement in the group.
     *
     * @param annoucementID The ID of the announcement, as a string.
     * @param headline The new title for the announcement.
     * @param content The new content for the announcement.
     * @param callback Optional. Called when the request completes.
     */
    editAnnouncement(
      annoucementID: string,
      headline: string,
      content: string,
      callback?: Callback,
    ): void;

    /**
     * Deletes an announcement in the group.
     *
     * @param annoucementID The ID of the announcement, as a string.
     * @param callback Optional. Called when the request completes.
     */
    deleteAnnouncement(annoucementID: string, callback?: Callback): void;

    /**
     * Schedules a new event for the group. type can be one of the strings shown below, or an AppID to schedule a game-specific event.
     *
     * @param name The event's name/headline.
     * @param type Can be {@link GroupEventType}, or an `AppID` to schedule a game-specific event.
     * @param description A description for the event.
     * @param time `null` to start it immediately, otherwise a Date object representing a time in the future.
     * @param server If this is a game event (see below), this can be a string containing the game server's IP address or an object containing ip and password properties.
     * If not a game event, this should be null or undefined.
     * @param callback Called when the request completes.
     */
    scheduleEvent(
      name: string,
      type: GroupEventType | appid,
      description: string,
      time: null | Date,
      server: string | object,
      callback: Callback,
    ): void;

    /**
     * Edits an existing Steam group event. Parameters are identical to those in scheduleEvent.
     *
     * @param id The 64-bit numeric ID of the event you want to edit (as a string).
     * @param name The event's name/headline.
     * @param type See the docs {@link https://github.com/DoctorMcKay/node-steamcommunity/wiki/CSteamGroup#scheduleeventname-type-description-time-server-callback}.
     * @param description A description for the event.
     * @param time `null` to start it immediately, otherwise a Date object representing a time in the future.
     * @param server If this is a game event (see below), this can be a string containing the game server's IP address or an object containing ip and password properties.
     * If not a game event, this should be null or undefined.
     * @param callback Called when the request completes
     */
    editEvent(
      id: string,
      name: string,
      type: GroupEventType | string,
      description: string,
      time: null | Date,
      server: string | object,
      callback: Callback,
    ): void;

    /**
     * Deletes an existing Steam group event.
     *
     * @param id The 64-bit numeric ID of the event you want to delete (as a string).
     * @param callback Optional. Called when the request completes.
     */
    deleteEvent(id: string, callback?: Callback): void;

    /**
     * Changes the group's current Player of the Week.
     *
     * @param steamID A `SteamID` object representing the group's new Player of the Week.
     * @param callback Called when the request completes.
     */
    setPlayerOfTheWeek(
      steamID: SteamID,
      callback: (
        /** null on success, an Error object on failure. */
        err: CallbackError,
        /** A SteamID representing the former Player of the Week. */
        oldPOTW: SteamID,
        /** A SteamID representing the new Player of the Week. */
        newPOTW: SteamID,
      ) => any,
    ): void;

    /**
     * Kicks a player from the group.
     *
     * @param steamID A `SteamID` object representing the player to kick from the group.
     * @param callback Called when the request completes.
     */
    kick(steamID: SteamID, callback: Callback): void;

    /**
     * Requests a page of group history (visible at {@link https://steamcommunity.com/groups/yourgroup/history}).
     *
     * @param page The page of history that you're requesting, starting at 1.
     * @param callback
     */
    getHistory(
      page: any,
      callback: (err: CallbackError, history: GroupHistory) => any,
    ): void;

    /**
     * Gets a listing of comments in a Steam group.
     *
     * @param from The offset where you want to start. 0 to start with the first (most recent) comment.
     * @param count The number of comments you want to retrieve.
     * @param callback Called when the request completes.
     */
    getAllComments(
      from: number,
      count: number,
      callback: (
        err: CallbackError,
        /** An array of comments. */
        comments: GroupComment[],
      ) => any,
    ): void;

    /**
     * Deletes a comment in a Steam group, provided you have permission to do so (i.e. are the author or a group moderator/admin with the appropriate permission).
     *
     * @param cid The ID of the comment you want to delete.
     * @param callback Optional. Called when the request completes.
     */
    deleteComment(cid: cid, callback?: Callback): void;

    /**
     * @param message
     * @param callback Called when the request completes.
     */
    comment(message: string, callback: Callback): void;

    /**
     * Get requests to join this restricted group.
     *
     * @param callback - First argument is null/Error, second is array of SteamID objects
     */
    getJoinRequests(callback: Callback): void;

    /**
     * Respond to one or more join requests to this restricted group.
     *
     * @param steamIDs - The SteamIDs of the users you want to approve or deny membership for (or a single value)
     * @param approve - True to put them in the group, false to deny their membership
     * @param callback - Takes only an Error object/null as the first argument
     */
    respondToJoinRequests(
      steamIDs: SteamID | string | SteamID[] | string[],
      approve: boolean,
      callback: Callback,
    ): void;

    /**
     * Respond to *ALL* pending group-join requests for this group.
     *
     * @param approve - True to allow everyone who requested into the group, false to not
     * @param callback - Takes only an Error object/null as the first argument
     */
    respondToAllJoinRequests(approve: boolean, callback: Callback): void;
  }

  class CSteamUser {
    constructor(community: any, userData: any, customurl: any);

    /** A SteamID object containing the user's SteamID. Visit a user's profile at https://steamcommunity.com/profiles/SteamID */
    steamID: SteamID;
    /** The user's current profile name (can be changed). */
    name: string;
    /** The user's current online state. One of `in-game`, `online`, or `offline`. */
    onlineState: 'in-game' | 'online' | 'offline';
    /** A message describing the user's current online state. Displayed on the profile below their status. */
    stateMessage: string;
    /** One of `public`, `friendsonly`, `private`. May also be a legacy value like `friendsfriendsonly`, these should be treated as private. */
    privacyState: 'public' | 'friendsonly' | 'private' | string;
    /** The user's visibility state relative to you, as an integer. `1` if visible, `0` if private. If privateState is a legacy value, this will be 1 although it should in effect be 0. */
    visibilityState: 0 | 1;
    /** The hash of the user's avatar. */
    avatarHash: string;
    /** `true` if the user has one or more VAC bans on record, `false` otherwise. */
    vacBanned: boolean;
    /** One of `None`, `Probation`, or `Banned`. */
    tradeBanState: 'None' | 'Probation' | 'Banned';
    /** `true` if the user's account is limited, `false` otherwise. */
    isLimitedAccount: boolean;
    /** The user's custom vanity URL. */
    customURL: string;
    /** A Date object for the user's account creation date (unavailable and null if private). */
    memberSince: Date;
    /** The user's given location (unavailable and null if private or not provided). */
    location: string | null;
    /** The user's given real name (unavailable and null if private or not provided). */
    realName: string | null;
    /** The user's profile summary (unavailable and null if private). */
    summary: string | null;
    /** An array of SteamID objects for the user's joined groups. */
    groups: SteamID[];
    /** A SteamID object for the user's chosen primary group. */
    primaryGroup: SteamID;

    /**
     * Returns a URL where you can download this user's avatar image
     *
     * @param size Optional. One of small (default), medium, full.
     * @param protocol Optional. One of http:// (default), https://,
     */
    getAvatarURL(
      size?: string,
      protocol?: 'http://' | 'https://' | string,
    ): void;

    /**
     * Adds the user as a friend.
     *
     * @param callback Optional.
     */
    addFriend(callback?: Callback): void;

    /**
     * Accepts a pending friend request from this user.
     *
     * @param callback Optional.
     */
    acceptFriendRequest(callback?: Callback): void;

    /**
     * Removes the user from your friends list.
     *
     * @param callback Optional.
     */
    removeFriend(callback?: Callback): void;

    /**
     * Blocks all communication with the user.
     *
     * @param callback Optional.
     */
    blockCommunication(callback?: Callback): void;

    /**
     * Removes the user from your blocked list.
     *
     * @param callback Optional.
     */
    unblockCommunication(callback?: Callback): void;

    /**
     * Attempts to post a comment on the user's profile. Fails if profile is private or you don't have permission to post comments on the user's profile.
     *
     * @param message The message to leave on the user's profile.
     * @param callback Optional.
     */
    comment(message: any, callback?: Callback): void;

    /**
     * Deletes a comment from a user's profile. Must be your own profile, or your own comment on someone else's profile.
     *
     * @param commentID The ID of the comment you want to delete.
     * @param callback Optional. Called when the request completes.
     */
    deleteComment(commentID: string, callback: Callback): void;

    /**
     * Gets comments from a user's Steam profile.
     *
     * @param options Optional. An object containing zero or more of these properties.
     * @param callback Called when the request completes.
     */
    getComments(
      options: Array<{
        /** The offset of the first comment you want to retrieve (default 0). */
        start: number;
        /** How many comments you want to retrieve. */
        count: number;
      }>,
      callback: (
        err: CallbackError,
        /** An array containing objects representing the comments. */
        comments: UserComment[],
        /** The total number of comments on this profile. */
        totalCount: number,
      ) => any,
    ): void;

    /**
     * Attempts to invite the user to a Steam group. Fails if you're not friends with them.
     *
     * @param groupID The SteamID of the group, as a SteamID object or a string which can be parsed into one.
     * @param callback Optional.
     */
    inviteToGroup(groupID: gid, callback?: Callback): void;

    /**
     * Gets a user's persona name history.
     *
     * @param callback Required. Called when requested data is available.
     */
    getAliases(
      callback: (
        err: CallbackError,
        /** A string containing the user's profile background URL. `null` if they have no custom background. */
        backgroundUrl: string | null,
      ) => any,
    ): void;

    /**
     * Get the background URL of user's profile.
     * @param callback Required. Called when requested data is available.
     */
    getProfileBackground(
      callback: () => {
        err: CallbackError;
        /** A string containing the user's profile background URL. `null` if they have no custom background. */
        backgroundUrl: string | null;
      },
    ): void;

    /**
     * Upload an image to Steam and send it to the target user over chat.
     * @param imageContentsBuffer - The image contents, as a Buffer
     * @param options Optional. An object with zero or more of these properties.
     * @param callback Required. Called when the request completes
     */
    sendImage(
      imageContentsBuffer: Buffer,
      options: {
        /** `true` to mark this as a spoiler (default `false`). */
        spoiler: boolean;
      },
      callback: (
        err: CallbackError,
        /** The URL to the uploaded image. */
        imageUrl: string,
      ) => any,
    ): void;
  }

  export default interface SteamCommunity
    extends EventEmitter,
      Confirmations,
      Groups,
      Help,
      Helpers,
      Http,
      Market,
      Profile,
      TwoFactor,
      Users,
      WebApi {}

  export default class SteamCommunity {
    constructor(options?: Options);

    /**
     * Invalidates your account's existing trade URL and generates a new token, which is returned in the callback.
     *
     * @param callback
     */
    changeTradeURL(
      callback: (
        err: CallbackError,
        /** Your new full trade URL, e.g. https://steamcommunity.com/tradeoffer/new/?partner=46143802&token=xxxxxxxx. */
        url: string,
        /** Just the token parameter from your new trade URL. */
        token: string,
      ) => any,
    ): void;

    /**
     * Clears your Steam profile name history (aliases).
     * @param callback
     */
    clearPersonaNameHistory(callback: Callback): any;

    /**
     * Retrieves a token that can be used to log on via node-steam-user.
     *
     * @param callback
     */
    getClientLogonToken(
      callback: (err: CallbackError, details: TokenDetails) => any,
    ): void;

    /**
     * Retrieves a list of your friend relationships. Includes friends, invited friends, users who invited us to be friends, and blocked users.
     *
     * @param callback A function to be called when the request completes
     */
    getFriendsList(
      callback: (
        err: CallbackError,
        /** An object whose keys are 64-bit SteamIDs, and values are EFriendRelationship values. */
        users: any,
      ) => any,
    ): void;

    /**
     * Retrieves friends list limit
     *
     * @param callback A function to be called when the request completes
     */
    getFriendsLimit(callback: (err: CallbackError, limit: number) => any): void;

    /**
     * Creates and returns a CMarketItem object for a particular item.
     *
     * @param appid The ID of the app to which this item belongs.
     * @param hashName The item's market_hash_name.
     * @param currency
     * @param callback Called when the item data is loaded and ready.
     */
    getMarketItem(
      appid: string,
      hashName: string,
      currency: string,
      callback: (
        err: CallbackError,
        /** A CMarketItem instance. */
        item: CMarketItem,
      ) => any,
    ): void;

    /**
     * Gets your account's notifications (the things under the green envelope button on the top-right.
     *
     * @param callback Fired when the requested data is available.
     */
    getNotifications(
      callback: (
        err: CallbackError,
        /** An object containing properties for each notification type. The values of each property are the number of your notifications of that type. */
        notifications: Notifications,
      ) => any,
    ): void;

    /**
     * Returns the session ID of your current session, or generates a new one if you don't have a session yet. You probably won't need to use this.
     *
     * @param host
     */
    getSessionID(host: any): any;

    /**
     * Creates and returns a `CSteamGroup` object for a particular group.
     *
     * @param id Either a `SteamID` object or a group's URL (the part after /groups/)
     * @param callback
     */
    getSteamGroup(
      id: SteamID | string,
      callback: (
        err: CallbackError,
        /** A `CSteamGroup` instance. */
        group: CSteamGroup,
      ) => any,
    ): void;

    /**
     * Creates and returns a CSteamUser object for a particular user.
     *
     * @param id Either a SteamID object or a user's URL (the part after /id/).
     * @param callback
     */
    getSteamUser(
      id: SteamID | string,
      callback: (
        err: CallbackError,
        /** A `CSteamUser` instance. */
        user: CSteamUser,
      ) => any,
    ): void;

    /**
     * Gets your account's trade URL, which can be used by people who aren't your friends on Steam to send you trade offers.
     *
     * @param callback A callback to be invoked on completion.
     */
    getTradeURL(
      callback: (
        err: CallbackError,
        /** Your full trade URL, e.g. https://steamcommunity.com/tradeoffer/new/?partner=46143802&token=xxxxxxxx. */
        url: string,
        /** Just the token parameter from your trade URL. */
        token: string,
      ) => any,
    ): void;

    /**
     * Use this method to check whether or not you're currently logged into Steam and what your Family View status is.
     *
     * @param callback Called when the result is available.
     */
    loggedIn(
      callback: (
        err: CallbackError,
        /** `true` if you're currently logged in, `false` otherwise. */
        loggedIn: boolean,
        /** `true` if you're currently in family view, `false` otherwise. If `true`, you'll need to call parentalUnlock with the correct PIN before you can do anything.. */
        familyView: boolean,
      ) => any,
    ): void;

    /**
     * Searches the market for a particular query. If you provide an appid to options, you can also search for tags.
     * Simply add your search tags with the tag's name being the key and the tag's internal value being the value.
     *
     * @param options Provide a string to just search for that string, otherwise an object.
     * @param callback Called when results are available.
     */
    marketSearch(
      options:
        | string
        | {
            /** The query string to search for. */
            query: string;
            /** The AppID of the game you're searching for. */
            appid: appid;
            /** `true` to also search in the descriptions of items (takes longer to search), `false` or omitted otherwise. */
            searchDescriptions: boolean;
          },
      callback: (
        /**
         * If an error occurred, this will be an Error object.
         * If the item is not on the market or doesn't exist, the message property will be "There were no items matching your search. Try again with different keywords."
         */
        err: CallbackError,
        /** An array of `CMarketSearchResult` instances. */
        items: CMarketSearchResult[],
      ) => any,
    ): void;

    /**
     * Facilitates passwordless login using details received from a previous login request.
     *
     * @param steamguard The steamguard value from the callback of login.
     * @param token The oAuthToken value from the callback of login.
     * @param callback Called when the login request completes
     */
    oAuthLogin(
      steamguard: string,
      token: string,
      callback: (
        /** If an error occurred, this is an Error object. Otherwise, null. */
        err: CallbackError,
        /** true if you're currently logged in, false otherwise. */
        loggedIn: boolean,
        /** true if you're currently in family view, false otherwise. If true, you'll need to call parentalUnlock with the correct PIN before you can do anything. */
        familyView: boolean,
      ) => any,
    ): void;

    /**
     * If your account has Family View enabled, calling this will disable it for your current session.
     *
     * @param pin Your 4-digit Family View PIN.
     * @param callback An optional callback to be invoked on completion.
     */
    parentalUnlock(pin: number, callback: Callback): void;

    /**
     * Loads your inventory page, which resets your new items notification to 0.
     *
     * @param callback An optional callback to be invoked on completion.
     */
    resetItemNotifications(callback?: Callback): void;

    /**
     * Use this to resume a previous session or to use a session that was negotiated elsewhere (using node-steam-user, for instance).
     *
     * @param cookies An array of cookies (as name=value pair strings).
     */
    setCookies(cookies: string[]): void;

    /**
     * Emitted when an HTTP request is made which requires a login, and Steam redirects us to the login page (i.e. we aren't logged in). You should re-login when you get this event.
     * Note that this will be emitted continuously until you log back in. This event being emitted doesn't stop the
     * module from attempting further requests (as a result of method calls, timers, etc) so you should ensure that you limit your logins.
     *
     * @param event "sessionExpired"
     * @param listener Emitted when an HTTP request is made which requires a login, and Steam redirects us to the login page (i.e. we aren't logged in).
     */
    on(event: 'sessionExpired', listener: Events.sessionExpired): this;

    /**
     * This event will be emitted when the confirmation checker needs a new confirmation key to continue. Keys that can be reused will be saved for up to five minutes before they are requested again.
     *
     * @param event "confKeyNeeded"
     * @param listener This event will be emitted when the confirmation checker needs a new confirmation key to continue.
     * @example
     * community.on('confKeyNeeded', function(tag, callback) {
     *     const time = Math.floor(Date.now() / 1000);
     *     callback(null, time, SteamTotp.getConfirmationKey(identitySecret, time, tag));
     * });
     */
    on(event: 'confKeyNeeded', listener: Events.confKeyNeeded): this;

    /**
     * Emitted when a new confirmation is received. This will be emitted once per confirmation.
     *
     * A special property `offerID` will be defined which is the ID of the trade offer that the confirmation is confirming.
     * If this confirmation isn't for an offer, this will be `undefined`. Adding this property requires one request per confirmation to find the offer ID.
     * If you don't need these IDs and you want to save requests, always return an error in the `confKeyNeeded` event when the tag is "details".
     *
     * This event will be emitted at most once per second. This is to ensure that you don't accidentally generate the same key twice for two confirmations.
     *
     * @param event "newConfirmation"
     * @param listener Emitted when a new confirmation is received. This will be emitted once per confirmation.
     */
    on(event: 'newConfirmation', listener: Events.newConfirmation): this;

    /**
     * Emitted when the automatic confirmation checker auto-accepts a confirmation with success.
     *
     * @param event "confirmationAccepted"
     * @param listener Emitted when the automatic confirmation checker auto-accepts a confirmation with success.
     */
    on(
      event: 'confirmationAccepted',
      listener: Events.confirmationAccepted,
    ): this;

    on(
      type: 'debug' | string | number,
      listener: (...args: any[]) => void,
    ): this;

    steamID: SteamID;
  }

  interface Options {
    /**
     * An instance of {@link https://www.npmjs.com/package/request|request} v2.x.x which will be used by `SteamCommunity` for its HTTP requests.
     * SteamCommunity` will create its own if omitted.
     */
    request: Request;

    /**
     * The time in milliseconds that `SteamCommunity` will wait for HTTP requests to complete.
     * Defaults to `50000` (50 seconds). Overrides any `timeout` option that was set on the passed-in `request` object.
     */
    timeout: number;

    /**
     * The user-agent value that `SteamCommunity` will use for its HTTP requests. Defaults to Chrome v47's user-agent.
     * Overrides any `headers['User-Agent']` option that was set on the passed-in `request` object.
     */
    userAgent: string;

    /** The local IP address that `SteamCommunity` will use for its HTTP requests. Overrides an `localAddress` option that was set on the passed-in `request` object. */
    localAddress: string;
  }

  interface TokenDetails {
    /** Your account's SteamID, as a SteamID object. */
    steamID: SteamID;
    /** Your account's logon name. */
    accountName: string;
    /** Your logon token. */
    webLogonToken: string;
  }

  interface Notifications {
    comments: number;
    items: number;
    invites: number;
    gifts: number;
    chat: number;
    trades: number;
    gameTurns: number;
    moderatorMessages: number;
    helpRequestReplies: number;
    accountAlerts: number;
  }

  interface LoginOptions {
    /** Your Steam account name. */
    accountName: string;
    /** Your Steam password. */
    password: string;
    /** Your Steam Guard value (only required if logging in with a Steam Guard authorization). */
    steamguard?: string;
    /** Your Steam Guard email code (only required if logging in with a new email auth code). */
    authCode?: string;
    /** Your Steam Guard app code (only required if logging in with a Steam Guard app code). */
    twoFactorCode?: string;
    /** Value of prompted captcha (only required if you have been prompted with a CAPTCHA). */
    captcha?: string;
    /** Pass `true` here to have node-steamcommunity not use the mobile login flow. This might help keep your login session alive longer, but you won't get an oAuth token in the login response. */
    disableMobile?: boolean;
  }

  interface EditProfileSettings {
    /** Your new profile name. */
    name: string;
    /** Your new profile "real name", or empty string to remove it. */
    realName: string;
    /** Your new profile summary. */
    summary: any;
    /** A country code, like US, or empty string to remove it. */
    country: string;
    /** A state code, like FL, or empty string to remove it. */
    state: string;
    /** A numeric city code, or empty string to remove it. */
    city: number | string;
    /** Your new profile custom URL. */
    customURL: string;
    /** The assetid of an owned profile background which you want to equip, or empty string to remove it. */
    background: string;
    /** The ID of your new featured badge, or empty string to remove it. Currently game badges aren't supported, only badges whose pages end in /badge/<id>. */
    featuredBadge: string;
    /** A SteamID object for your new primary Steam group, or a string which can parse into a SteamID. */
    primaryGroup: SteamID | string;
  }

  interface ProfileSetting {
    /** A value from PrivacyState for your desired profile privacy state. */
    profile: PrivacyState;
    /** A value from PrivacyState for your desired profile comments privacy state. */
    comments: PrivacyState;
    /** A value from PrivacyState for your desired inventory privacy state. */
    inventory: PrivacyState;
    /** true to keep your Steam gift inventory private, false otherwise. */
    inventoryGifts: boolean;
    /** A value from PrivacyState for your desired privacy level required to view games you own and what game you're currently playing. */
    gameDetails: PrivacyState;
    /** `true` to keep your game playtime private, `false` otherwise. */
    playtime: boolean;
    /** A value from PrivacyState for your desired privacy level required to view your friends list. */
    friendsList: PrivacyState;
  }

  interface GroupItemHistory {
    /** A string containing the item history type. This is the type displayed on the history page, without spaces. For example, NewMember, InviteSent, etc.. */
    type: string;
    /** A Date object containing the date and time when this action took place. Since the history page doesn't display any years, the year could possibly be incorrect.. */
    date: Date;
    /**
     * A SteamID object containing the SteamID of the user who either performed or received this action.
     * For example, on NewMember this is the new group member, on InviteSent this is the invite recipient, on NewAnnouncement, this is the author.
     */
    user: SteamID;
    /** Not present on all history types. This is the user who performed the action if user is the receipient of the action. */
    actor: any;
  }

  interface GroupHistory {
    /** The index of the first history item on this page, starting at 1. */
    first: number;
    /** The index of the last history item on this page. */
    last: number;
    /** How many total history items there are. */
    total: number;
    /** An array of group history objects. */
    items: GroupItemHistory[];
  }

  interface GroupComment {
    /** The comment author's persona name. */
    authorName: string;
    /** Either the comment author's 64-bit Steam ID, or their vanity URL. */
    authorId: string;
    /** A Date object of when this comment was submitted. */
    date: Date;
    /** The ID of this comment. */
    commentId: string;
    /** The HTML content of this comment. */
    text: string;
  }

  interface UserComment {
    /** The ID of the comment. */
    id: any;
    author: {
      /** A SteamID object. */
      steamID: SteamID;
      /** The commenter's name. */
      name: any;
      /** A URL to the commenter's avatar. */
      avatar: string;
      /** offline/online/in-game. */
      state: 'offline' | 'online' | 'in-game';
    };
    /** A Date object. */
    date: Date;
    /** The text of the comment. May contain special characters like newlines or tabs. */
    text: any;
    /** The rendered HTML of the comment. */
    html: any;
  }

  interface Announcement {
    /** The announcement's title. */
    headline: string;
    /** The content of the announcement. */
    content: string;
    /** A Date object for when this was posted. */
    date: Date;
    /** The Steam profile name of the author. */
    author: string;
    /** The ID of the announcement. */
    aid: string;
  }

  interface Tag {
    internal_name: string;
    name: string;
    category: string;
    color: string;
    category_name: string;
    localized_tag_name: string;
    localized_category_name: string;
  }

  interface CEconItemDescription {
    type: string;
    value?: string;
    color?: string;
    app_data?: string;
  }

  interface CEconItemAction {
    link?: string;
    name?: string;
  }

  namespace Events {
    /**
     * @param err An `Error` object.
     */
    type sessionExpired = (err: CallbackError) => void;

    /**
     * @param tag If an error occurred when you were getting the key, pass an `Error` object here and no further arguments. If successful, pass `null` here.
     * @param callback The Unix timestamp that you used to generate this key.
     */
    type confKeyNeeded = (tag: string, callback: confKeyNeededCallback) => void;

    /**
     * You should call this function when you have the key ready.
     *
     * @param err If an error occurred when you were getting the key, pass an `Error` object here and no further arguments. If successful, pass `null` here.
     * @param time The Unix timestamp that you used to generate this key.
     * @param key The base64 string key.
     */
    type confKeyNeededCallback = (
      err: CallbackError,
      time: number,
      key: string,
    ) => void;

    /**
     * @param confirmation A `CConfirmation` object.
     */
    type newConfirmation = (confirmation: CConfirmation) => void;

    /**
     * @param confirmation A `CConfirmation` object.
     */
    type confirmationAccepted = (confirmation: CConfirmation) => void;
  }

  type GroupEventType =
    | 'ChatEvent'
    | 'OtherEvent'
    | 'PartyEvent'
    | 'MeetingEvent'
    | 'SpecialCauseEvent'
    | 'MusicAndArtsEvent'
    | 'SportsEvent'
    | 'TripEvent';

  type AvatarSizeType = 'full' | 'medium' | 'small';
  type ProtocolType = 'http://' | 'https://' | '//';
  type ImageFormat = 'jpg' | 'jpeg' | 'gif' | 'png';

  /**
   * @param err `null` on success, an `Error` object on failure.
   */
  type Callback = (err: CallbackError) => any;

  /** `null` on success, an `Error` object on failure. */
  type CallbackError = (Error & { [key: string]: any }) | null;

  /** Unique and can change after a trade. */
  type assetid = number | string;

  type userid = SteamID | string;

  type appid = number;

  /** 2 for csgo... */
  type contextid = number;

  /**
   * In a nutshell, a classid "owns" an instanceid. The classid is all you need to get a general overview of an item.
   * For example, items with the same classid will pretty much always have the same name and image.
   */
  type classid = number;

  /** An ID that describes an item instance that inherits properties from a class with the class id being noted in the instance (totally not unique). */
  type instanceid = number;

  type packageid = number | string;

  type cid = number | string;

  type gid = SteamID | string;

  enum PrivacyState {
    'Private' = 1,
    'FriendsOnly' = 2,
    'Public' = 3,
  }

  /**
   * 1 is unknown, possibly "Invalid".
   * 4 is opt-out or other like account confirmation?
   */
  enum ConfirmationType {
    'Trade' = 2,
    'MarketListing' = 3,
  }

  enum EFriendRelationship {
    'None' = 0,
    'Blocked' = 1,
    'RequestRecipient' = 2,
    'Friend' = 3,
    'RequestInitiator' = 4,
    'Ignored' = 5,
    'IgnoredFriend' = 6,
    'SuggestedFriend' = 7,
  }

  enum PersonaState {
    'Offline' = 0,
    'Online' = 1,
    'Busy' = 2,
    'Away' = 3,
    'Snooze' = 4,
    'LookingToTrade' = 5,
    'LookingToPlay' = 6,
    'Invisible' = 7,
  }

  enum PersonaStateFlag {
    'HasRichPresence' = 1,
    'InJoinableGame' = 2,
    'Golden' = 4,
    'RemotePlayTogether' = 8,
    'OnlineUsingWeb' = 256,
    'ClientTypeWeb' = 256,
    'OnlineUsingMobile' = 512,
    'ClientTypeMobile' = 512,
    'OnlineUsingBigPicture' = 1024,
    'ClientTypeTenfoot' = 1024,
    'OnlineUsingVR' = 2048,
    'ClientTypeVR' = 2048,
    'LaunchTypeGamepad' = 4096,
    'LaunchTypeCompatTool' = 8192,
  }

  enum EResult {
    'Invalid' = 0,
    'OK' = 1,
    'Fail' = 2,
    'NoConnection' = 3,
    'InvalidPassword' = 5,
    'LoggedInElsewhere' = 6,
    'InvalidProtocolVer' = 7,
    'InvalidParam' = 8,
    'FileNotFound' = 9,
    'Busy' = 10,
    'InvalidState' = 11,
    'InvalidName' = 12,
    'InvalidEmail' = 13,
    'DuplicateName' = 14,
    'AccessDenied' = 15,
    'Timeout' = 16,
    'Banned' = 17,
    'AccountNotFound' = 18,
    'InvalidSteamID' = 19,
    'ServiceUnavailable' = 20,
    'NotLoggedOn' = 21,
    'Pending' = 22,
    'EncryptionFailure' = 23,
    'InsufficientPrivilege' = 24,
    'LimitExceeded' = 25,
    'Revoked' = 26,
    'Expired' = 27,
    'AlreadyRedeemed' = 28,
    'DuplicateRequest' = 29,
    'AlreadyOwned' = 30,
    'IPNotFound' = 31,
    'PersistFailed' = 32,
    'LockingFailed' = 33,
    'LogonSessionReplaced' = 34,
    'ConnectFailed' = 35,
    'HandshakeFailed' = 36,
    'IOFailure' = 37,
    'RemoteDisconnect' = 38,
    'ShoppingCartNotFound' = 39,
    'Blocked' = 40,
    'Ignored' = 41,
    'NoMatch' = 42,
    'AccountDisabled' = 43,
    'ServiceReadOnly' = 44,
    'AccountNotFeatured' = 45,
    'AdministratorOK' = 46,
    'ContentVersion' = 47,
    'TryAnotherCM' = 48,
    'PasswordRequiredToKickSession' = 49,
    'AlreadyLoggedInElsewhere' = 50,
    'Suspended' = 51,
    'Cancelled' = 52,
    'DataCorruption' = 53,
    'DiskFull' = 54,
    'RemoteCallFailed' = 55,
    'PasswordNotSet' = 56,
    'PasswordUnset' = 56,
    'ExternalAccountUnlinked' = 57,
    'PSNTicketInvalid' = 58,
    'ExternalAccountAlreadyLinked' = 59,
    'RemoteFileConflict' = 60,
    'IllegalPassword' = 61,
    'SameAsPreviousValue' = 62,
    'AccountLogonDenied' = 63,
    'CannotUseOldPassword' = 64,
    'InvalidLoginAuthCode' = 65,
    'AccountLogonDeniedNoMailSent' = 66,
    'AccountLogonDeniedNoMail' = 66,
    'HardwareNotCapableOfIPT' = 67,
    'IPTInitError' = 68,
    'ParentalControlRestricted' = 69,
    'FacebookQueryError' = 70,
    'ExpiredLoginAuthCode' = 71,
    'IPLoginRestrictionFailed' = 72,
    'AccountLocked' = 73,
    'AccountLockedDown' = 73,
    'AccountLogonDeniedVerifiedEmailRequired' = 74,
    'NoMatchingURL' = 75,
    'BadResponse' = 76,
    'RequirePasswordReEntry' = 77,
    'ValueOutOfRange' = 78,
    'UnexpectedError' = 79,
    'Disabled' = 80,
    'InvalidCEGSubmission' = 81,
    'RestrictedDevice' = 82,
    'RegionLocked' = 83,
    'RateLimitExceeded' = 84,
    'AccountLogonDeniedNeedTwoFactorCode' = 85,
    'AccountLoginDeniedNeedTwoFactor' = 85,
    'ItemOrEntryHasBeenDeleted' = 86,
    'ItemDeleted' = 86,
    'AccountLoginDeniedThrottle' = 87,
    'TwoFactorCodeMismatch' = 88,
    'TwoFactorActivationCodeMismatch' = 89,
    'AccountAssociatedToMultiplePlayers' = 90,
    'AccountAssociatedToMultiplePartners' = 90,
    'NotModified' = 91,
    'NoMobileDeviceAvailable' = 92,
    'NoMobileDevice' = 92,
    'TimeIsOutOfSync' = 93,
    'TimeNotSynced' = 93,
    'SMSCodeFailed' = 94,
    'TooManyAccountsAccessThisResource' = 95,
    'AccountLimitExceeded' = 95,
    'AccountActivityLimitExceeded' = 96,
    'PhoneActivityLimitExceeded' = 97,
    'RefundToWallet' = 98,
    'EmailSendFailure' = 99,
    'NotSettled' = 100,
    'NeedCaptcha' = 101,
    'GSLTDenied' = 102,
    'GSOwnerDenied' = 103,
    'InvalidItemType' = 104,
    'IPBanned' = 105,
    'GSLTExpired' = 106,
    'InsufficientFunds' = 107,
    'TooManyPending' = 108,
    'NoSiteLicensesFound' = 109,
    'WGNetworkSendExceeded' = 110,
    'AccountNotFriends' = 111,
    'LimitedUserAccount' = 112,
    'CantRemoveItem' = 113,
    'AccountHasBeenDeleted' = 114,
    'AccountHasAnExistingUserCancelledLicense' = 115,
    'DeniedDueToCommunityCooldown' = 116,
    'NoLauncherSpecified' = 117,
    'MustAgreeToSSA' = 118,
    'ClientNoLongerSupported' = 119,
  }
}
