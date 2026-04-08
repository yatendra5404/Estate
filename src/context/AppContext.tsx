import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, doc, setDoc, getDoc } from 'firebase/firestore';

export type RequestItem = {
  id: string;
  name: string;
  category: string;
  urgency: 'LOW' | 'MID' | 'HIGH';
  notes?: string;
  requestedBy: string;
  requestedById: string;
  createdAt: string;
  purchasedAt?: string;
  status: 'PENDING' | 'URGENT' | 'BOUGHT' | 'COMPLETED';
  price?: number;
};

export type ShoppingItem = {
  id: string;
  name: string;
  requestedBy: string;
  requestedById: string;
  category: string;
  bought: boolean;
  price?: number;
  createdAt: string;
};

export type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  createdBy: string;
};

export type EstateConfig = {
  totalBudget: number;
  departmentTargets: {
    Maintenance: number;
    Utilities: number;
    Provisions: number;
    Staffing: number;
    Security: number;
  };
  homeHealth: {
    score: number;
    temperature: string;
    securityStatus: string;
  };
};

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
};

type AppContextType = {
  user: User | null;
  isAuthReady: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  requests: RequestItem[];
  addRequest: (request: Omit<RequestItem, 'id' | 'requestedBy' | 'requestedById' | 'createdAt' | 'status'>) => Promise<void>;
  toggleRequestStatus: (id: string, currentStatus: string) => Promise<void>;
  updateRequestPrice: (id: string, price: number) => Promise<void>;
  shoppingList: ShoppingItem[];
  toggleShoppingItem: (id: string, currentStatus: boolean) => Promise<void>;
  updateShoppingItemPrice: (id: string, price: number) => Promise<void>;
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'requestedBy' | 'requestedById' | 'createdAt' | 'bought'>) => Promise<void>;
  submitPurchases: () => Promise<void>;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdBy' | 'date'>) => Promise<void>;
  estateConfig: EstateConfig | null;
  updateEstateConfig: (config: Partial<EstateConfig>) => Promise<void>;
  appUsers: AppUser[];
  updateUserRole: (userId: string, role: 'admin' | 'member') => Promise<void>;
  resetAllData: () => Promise<void>;
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [estateConfig, setEstateConfig] = useState<EstateConfig | null>(null);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);

      if (currentUser) {
        // Ensure user document exists
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              name: currentUser.displayName || 'Unknown User',
              email: currentUser.email || '',
              role: 'member'
            });
          }
        } catch (error) {
          console.error("Error setting up user document", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) {
      setRequests([]);
      setShoppingList([]);
      setExpenses([]);
      setEstateConfig(null);
      setAppUsers([]);
      return;
    }

    const unsubRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const reqs: RequestItem[] = [];
      snapshot.forEach((doc) => {
        reqs.push({ id: doc.id, ...doc.data() } as RequestItem);
      });
      // Sort by createdAt descending
      reqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(reqs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'requests');
    });

    const unsubShopping = onSnapshot(collection(db, 'shoppingList'), (snapshot) => {
      const items: ShoppingItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as ShoppingItem);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setShoppingList(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'shoppingList');
    });

    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      const exps: Expense[] = [];
      snapshot.forEach((doc) => {
        exps.push({ id: doc.id, ...doc.data() } as Expense);
      });
      exps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setExpenses(exps);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'expenses');
    });

    const configDocRef = doc(db, 'estate', 'config');
    const unsubConfig = onSnapshot(configDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setEstateConfig(docSnap.data() as EstateConfig);
      } else {
        // Default config if not exists
        const defaultConfig: EstateConfig = {
          totalBudget: 650000,
          departmentTargets: {
            Maintenance: 150000,
            Utilities: 80000,
            Provisions: 120000,
            Staffing: 250000,
            Security: 50000,
          },
          homeHealth: {
            score: 98,
            temperature: '72°F Indoor',
            securityStatus: 'Secure'
          }
        };
        setDoc(configDocRef, defaultConfig).catch(e => console.error("Error setting default config", e));
        setEstateConfig(defaultConfig);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'estate/config');
    });

    let unsubUsers: () => void;

    // First, get the current user's document to check their role
    const currentUserRef = doc(db, 'users', user.uid);
    const unsubCurrentUser = onSnapshot(currentUserRef, (docSnap) => {
      let isAdmin = false;
      if (docSnap.exists()) {
        const userData = docSnap.data();
        isAdmin = userData.role === 'admin';
      }
      // Also check default admin
      if (user.email === "gurjarkhushboosingh2009@gmail.com" && user.emailVerified) {
        isAdmin = true;
      }

      if (unsubUsers) {
        unsubUsers();
      }

      if (isAdmin) {
        unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
          const usersList: AppUser[] = [];
          snapshot.forEach((d) => {
            usersList.push({ id: d.id, ...d.data() } as AppUser);
          });
          setAppUsers(usersList);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'users');
        });
      } else {
        if (docSnap.exists()) {
          setAppUsers([{ id: docSnap.id, ...docSnap.data() } as AppUser]);
        } else {
          setAppUsers([]);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users/currentUser');
    });

    return () => {
      unsubRequests();
      unsubShopping();
      unsubExpenses();
      unsubConfig();
      unsubCurrentUser();
      if (unsubUsers) {
        unsubUsers();
      }
    };
  }, [user, isAuthReady]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const addRequest = async (request: Omit<RequestItem, 'id' | 'requestedBy' | 'requestedById' | 'createdAt' | 'status'>) => {
    if (!user) return;
    try {
      const newRequest = {
        ...request,
        requestedBy: user.displayName || 'Unknown',
        requestedById: user.uid,
        createdAt: new Date().toISOString(),
        status: request.urgency === 'HIGH' ? 'URGENT' : 'PENDING',
      };
      await addDoc(collection(db, 'requests'), newRequest);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'requests');
    }
  };

  const toggleRequestStatus = async (id: string, currentStatus: string) => {
    if (!user) return;
    try {
      const newStatus = currentStatus === 'BOUGHT' ? 'PENDING' : 'BOUGHT';
      const itemRef = doc(db, 'requests', id);
      await updateDoc(itemRef, { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `requests/${id}`);
    }
  };

  const updateRequestPrice = async (id: string, price: number) => {
    if (!user) return;
    try {
      const itemRef = doc(db, 'requests', id);
      await updateDoc(itemRef, { price });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `requests/${id}`);
    }
  };

  const toggleShoppingItem = async (id: string, currentStatus: boolean) => {
    if (!user) return;
    try {
      const itemRef = doc(db, 'shoppingList', id);
      await updateDoc(itemRef, { bought: !currentStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shoppingList/${id}`);
    }
  };

  const updateShoppingItemPrice = async (id: string, price: number) => {
    if (!user) return;
    try {
      const itemRef = doc(db, 'shoppingList', id);
      await updateDoc(itemRef, { price });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `shoppingList/${id}`);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdBy' | 'date'>) => {
    if (!user) return;
    try {
      const newExpense = {
        ...expense,
        createdBy: user.uid,
        date: new Date().toISOString(),
      };
      await addDoc(collection(db, 'expenses'), newExpense);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'expenses');
    }
  };

  const addShoppingItem = async (item: Omit<ShoppingItem, 'id' | 'requestedBy' | 'requestedById' | 'createdAt' | 'bought'>) => {
    if (!user) return;
    try {
      const newItem = {
        ...item,
        requestedBy: user.displayName || 'Unknown',
        requestedById: user.uid,
        createdAt: new Date().toISOString(),
        bought: false,
      };
      await addDoc(collection(db, 'shoppingList'), newItem);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'shoppingList');
    }
  };

  const submitPurchases = async () => {
    if (!user) return;
    try {
      const boughtItems = requests.filter(item => item.status === 'BOUGHT');
      if (boughtItems.length === 0) return;

      // Calculate total amount
      const totalAmount = boughtItems.reduce((sum, item) => sum + (item.price || 0), 0);

      if (totalAmount > 0) {
        // Create a single expense for all bought items
        const newExpense = {
          amount: totalAmount,
          category: 'Provisions', // Default category for shopping
          description: `Shopping: ${boughtItems.map(i => i.name).join(', ')}`,
          createdBy: user.uid,
          date: new Date().toISOString(),
        };
        await addDoc(collection(db, 'expenses'), newExpense);
      }

      // Update the bought items to COMPLETED
      for (const item of boughtItems) {
        const itemRef = doc(db, 'requests', item.id);
        await updateDoc(itemRef, { status: 'COMPLETED', purchasedAt: new Date().toISOString() });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'requests/expenses');
    }
  };

  const updateEstateConfig = async (config: Partial<EstateConfig>) => {
    if (!user || !estateConfig) return;
    try {
      const configRef = doc(db, 'estate', 'config');
      await updateDoc(configRef, config);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'estate/config');
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'member') => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const resetAllData = async () => {
    if (!user) return;
    try {
      // In a real app, you'd use a Cloud Function to delete collections securely.
      // Here we simulate it by clearing the local state and logging out,
      // as deleting entire collections from the client is restricted by security rules.
      setRequests([]);
      setShoppingList([]);
      setExpenses([]);
      await logout();
    } catch (error) {
      console.error("Error resetting data:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthReady,
        login,
        logout,
        requests,
        addRequest,
        toggleRequestStatus,
        updateRequestPrice,
        shoppingList,
        toggleShoppingItem,
        updateShoppingItemPrice,
        addShoppingItem,
        submitPurchases,
        expenses,
        addExpense,
        estateConfig,
        updateEstateConfig,
        appUsers,
        updateUserRole,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
