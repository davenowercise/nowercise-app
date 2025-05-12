import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Message } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatDate } from "@/lib/utils";
import { Search, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch all contacts (patients for specialists, or specialists for patients)
  const { data: contacts, isLoading: contactsLoading } = useQuery<User[]>({
    queryKey: [user?.role === "specialist" ? "/api/specialist/patients" : "/api/patient/specialists"],
  });

  // Fetch conversation with selected user
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: !!selectedUserId,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Filter contacts by search term
  const filteredContacts = contacts?.filter(
    (contact) =>
      contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find the selected contact
  const selectedContact = contacts?.find(c => c.id === selectedUserId);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUserId) return;
    
    try {
      await apiRequest("POST", "/api/messages", {
        recipientId: selectedUserId,
        content: messageText,
      });
      
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col md:flex-row">
      <div className="w-full md:w-80 border-r border-gray-200 bg-white rounded-l-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-heading font-bold text-gray-800 mb-2">Messages</h1>
          <div className="relative">
            <Input
              type="text"
              placeholder="Search contacts..."
              className="pl-8 pr-4 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        <ScrollArea className="flex-grow">
          {contactsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center p-2">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContacts && filteredContacts.length > 0 ? (
            <div className="p-2">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  className={`w-full flex items-center p-2 rounded-md text-left transition-colors ${
                    selectedUserId === contact.id
                      ? "bg-primary-light/10 text-primary"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedUserId(contact.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={contact.profileImageUrl} alt={contact.firstName || ""} />
                    <AvatarFallback className="bg-primary-light text-white">
                      {getInitials(contact.firstName, contact.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium truncate">
                      {contact.firstName
                        ? `${contact.firstName} ${contact.lastName || ""}`
                        : contact.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {contact.role === "specialist"
                        ? "Cancer Exercise Specialist"
                        : contact.email || "Patient"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No contacts found</p>
            </div>
          )}
        </ScrollArea>
      </div>
      
      <div className="flex-grow bg-white rounded-r-lg overflow-hidden flex flex-col">
        {selectedUserId ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center">
              {selectedContact && (
                <>
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={selectedContact.profileImageUrl} alt={selectedContact.firstName || ""} />
                    <AvatarFallback className="bg-primary-light text-white">
                      {getInitials(selectedContact.firstName, selectedContact.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedContact.firstName
                        ? `${selectedContact.firstName} ${selectedContact.lastName || ""}`
                        : selectedContact.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedContact.role === "specialist"
                        ? "Cancer Exercise Specialist"
                        : "Patient"}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <ScrollArea className="flex-grow p-4 bg-gray-50">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          i % 2 === 0
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-white rounded-tl-none"
                        }`}
                      >
                        <Skeleton
                          className={`h-4 w-32 ${
                            i % 2 === 0 ? "bg-white/20" : "bg-gray-200"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isSender = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            isSender
                              ? "bg-primary text-white rounded-tr-none"
                              : "bg-white rounded-tl-none"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isSender ? "text-white/70" : "text-gray-500"
                            }`}
                          >
                            {formatDate(new Date(message.createdAt), "HH:mm")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </ScrollArea>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <Input
                  placeholder="Type your message..."
                  className="flex-grow mr-2"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="bg-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
            <div className="mb-4">
              <Send className="h-12 w-12 mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
            <p className="text-center">
              Select a contact from the list to start a conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
