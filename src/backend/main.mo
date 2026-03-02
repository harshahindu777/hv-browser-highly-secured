import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    // Other user info as needed
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // AI Assistant
  type AIAssistantMessage = {
    id : Nat;
    content : Text;
    timestamp : Int;
  };

  type AIAssistantActivity = {
    id : Nat;
    task : Text;
    status : Text;
    timestamp : Int;
  };

  let assistantMessages = Map.empty<Nat, AIAssistantMessage>();
  let assistantActivities = Map.empty<Nat, AIAssistantActivity>();
  var nextMessageId = 0;
  var nextActivityId = 0;

  public shared ({ caller }) func createAssistantMessage(content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can interact with AI Assistant");
    };
    let message : AIAssistantMessage = {
      id = nextMessageId;
      content;
      timestamp = Time.now();
    };
    assistantMessages.add(nextMessageId, message);
    nextMessageId += 1;
    message.id;
  };

  public query ({ caller }) func getAssistantMessages() : async [AIAssistantMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access AI Assistant messages");
    };
    assistantMessages.values().toArray();
  };

  public shared ({ caller }) func createAssistantActivity(task : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can interact with AI Assistant");
    };
    let activity : AIAssistantActivity = {
      id = nextActivityId;
      task;
      status = "Pending";
      timestamp = Time.now();
    };
    assistantActivities.add(nextActivityId, activity);
    nextActivityId += 1;
    activity.id;
  };

  public shared ({ caller }) func updateAssistantActivityStatus(activityId : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update AI Assistant activities");
    };
    switch (assistantActivities.get(activityId)) {
      case (?activity) {
        let updatedActivity = { activity with status };
        assistantActivities.add(activityId, updatedActivity);
      };
      case (null) {
        Runtime.trap("Activity not found");
      };
    };
  };

  public query ({ caller }) func getAssistantActivities() : async [AIAssistantActivity] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access AI Assistant activities");
    };
    assistantActivities.values().toArray();
  };

  // SURF Contextual Recorder (CR)
  type CRMessage = {
    id : Nat;
    author : Principal;
    content : Text;
    timestamp : Int;
    parentId : Nat;
  };

  type CRThread = {
    id : Nat;
    title : Text;
    author : Principal;
    messages : List.List<CRMessage>;
    timestamp : Int;
  };

  let threads = Map.empty<Nat, CRThread>();
  var nextThreadId = 0;

  public shared ({ caller }) func createThread(title : Text, initialMessage : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create threads");
    };
    let initialCRMessage : CRMessage = {
      id = 0;
      author = caller;
      content = initialMessage;
      timestamp = Time.now();
      parentId = 0;
    };
    let thread : CRThread = {
      id = nextThreadId;
      title;
      author = caller;
      messages = List.fromArray<CRMessage>([initialCRMessage]);
      timestamp = Time.now();
    };
    threads.add(nextThreadId, thread);
    nextThreadId += 1;
    thread.id;
  };

  public shared ({ caller }) func addCRMessage(threadId : Nat, parentId : Nat, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add messages");
    };
    switch (threads.get(threadId)) {
      case (?thread) {
        let newCRMessage : CRMessage = {
          id = thread.messages.size();
          author = caller;
          content;
          timestamp = Time.now();
          parentId;
        };
        thread.messages.add(newCRMessage);
        threads.add(threadId, thread);
        newCRMessage.id;
      };
      case (null) {
        Runtime.trap("Thread not found");
      };
    };
  };

  public query ({ caller }) func getThreadMessages(threadId : Nat) : async [CRMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access messages");
    };
    switch (threads.get(threadId)) {
      case (?thread) { thread.messages.toArray() };
      case (null) { Runtime.trap("Thread not found") };
    };
  };

  // Security & Privacy Assistant
  public type SecurityLevel = {
    #standard;
    #safer;
    #safest;
  };

  module SecurityLevel {
    public func fromText(text : Text) : SecurityLevel {
      switch (text) {
        case ("standard") { #standard };
        case ("safer") { #safer };
        case ("safest") { #safest };
        case (_) { Runtime.trap("Invalid security level: " # text) };
      };
    };
  };

  public type SearchEngine = {
    id : Nat;
    name : Text;
    url : Text;
    description : Text;
  };

  public type UserSettings = {
    defaultSearchEngine : Text;
    theme : Bool;
    javascriptEnabled : Bool;
    privacyMode : Bool;
    securityLevel : SecurityLevel;
    nextSearchEngineId : Nat;
    searchEngines : List.List<SearchEngine>;
    identityChecklist : Map.Map<Text, Bool>;
    auditChecklist : Map.Map<Text, Bool>;
  };

  let userSettings = Map.empty<Principal, UserSettings>();

  // Helper to get or initialize a user's settings
  func getUserSettings(caller : Principal) : UserSettings {
    switch (userSettings.get(caller)) {
      case (?settings) { settings };
      case (null) {
        let newSettings : UserSettings = {
          defaultSearchEngine = "Google";
          theme = false;
          javascriptEnabled = true;
          privacyMode = false;
          securityLevel = #standard;
          nextSearchEngineId = 0;
          searchEngines = List.empty<SearchEngine>();
          identityChecklist = Map.empty<Text, Bool>();
          auditChecklist = Map.empty<Text, Bool>();
        };
        userSettings.add(caller, newSettings);
        newSettings;
      };
    };
  };

  public shared ({ caller }) func setSecurityLevel(text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify settings");
    };
    let level = SecurityLevel.fromText(text);
    let settings = getUserSettings(caller);
    let updatedSettings = { settings with securityLevel = level };
    userSettings.add(caller, updatedSettings);
  };

  public query ({ caller }) func getSecurityLevel() : async SecurityLevel {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access settings");
    };
    let settings = getUserSettings(caller);
    settings.securityLevel;
  };

  public shared ({ caller }) func addSearchEngine(name : Text, url : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add search engines");
    };
    let settings = getUserSettings(caller);
    let newEngine : SearchEngine = {
      id = settings.nextSearchEngineId;
      name;
      url;
      description;
    };
    settings.searchEngines.add(newEngine);

    let updatedSettings = {
      settings with
      nextSearchEngineId = settings.nextSearchEngineId + 1;
    };
    userSettings.add(caller, updatedSettings);
  };

  public shared ({ caller }) func removeSearchEngine(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove search engines");
    };
    let settings = getUserSettings(caller);
    let filtered = settings.searchEngines.filter(func(engine) { engine.id != id });
    settings.searchEngines.clear();
    settings.searchEngines.addAll(filtered.values());
    userSettings.add(caller, settings);
  };

  public query ({ caller }) func getAllSearchEngines() : async [SearchEngine] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access search engines");
    };
    let settings = getUserSettings(caller);
    settings.searchEngines.toArray();
  };

  public shared ({ caller }) func toggleIdentityItem(key : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify identity checklist");
    };
    let settings = getUserSettings(caller);
    switch (settings.identityChecklist.get(key)) {
      case (?state) {
        settings.identityChecklist.add(key, not state);
      };
      case (null) {
        settings.identityChecklist.add(key, true);
      };
    };
    userSettings.add(caller, settings);
  };

  public shared ({ caller }) func setIdentityItem(key : Text, state : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify identity checklist");
    };
    let settings = getUserSettings(caller);
    settings.identityChecklist.add(key, state);
    userSettings.add(caller, settings);
  };

  public query ({ caller }) func getAllIdentityItems() : async [(Text, Bool)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access identity checklist");
    };
    let settings = getUserSettings(caller);
    settings.identityChecklist.entries().toArray();
  };

  public shared ({ caller }) func resetIdentityChecklist() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset identity checklist");
    };
    let settings = getUserSettings(caller);
    settings.identityChecklist.clear();
    userSettings.add(caller, settings);
  };

  public shared ({ caller }) func toggleAuditItem(key : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify audit checklist");
    };
    let settings = getUserSettings(caller);
    switch (settings.auditChecklist.get(key)) {
      case (?state) {
        settings.auditChecklist.add(key, not state);
      };
      case (null) {
        settings.auditChecklist.add(key, true);
      };
    };
    userSettings.add(caller, settings);
  };

  public shared ({ caller }) func setAuditItem(key : Text, state : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify audit checklist");
    };
    let settings = getUserSettings(caller);
    settings.auditChecklist.add(key, state);
    userSettings.add(caller, settings);
  };

  public query ({ caller }) func getAllAuditItems() : async [(Text, Bool)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access audit checklist");
    };
    let settings = getUserSettings(caller);
    settings.auditChecklist.entries().toArray();
  };

  public shared ({ caller }) func resetAuditChecklist() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can reset audit checklist");
    };
    let settings = getUserSettings(caller);
    settings.auditChecklist.clear();
    userSettings.add(caller, settings);
  };

  // Add more functionality as needed...
};

