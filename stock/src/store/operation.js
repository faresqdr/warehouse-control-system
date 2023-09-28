import { defineStore } from 'pinia'
import { db } from '@/firebase';
import { doc, runTransaction, getDoc } from "firebase/firestore";

function verifyExistsInInventory(inventory_array, article_id) {
    return inventory_array.filter((element) => element.hasOwnProperty(article_id)).length > 0;
}

function getArticlePositionInInventory(inventory_array, article_id) {
    const position = inventory_array.findIndex((element) => element.hasOwnProperty(article_id));
    return position > -1 ? position : null;
}

export const useOperationStore = defineStore('operation', {
    state: () => ({
        inventory: [],
    }),

    actions: {
        async get_article(article) {
            try {
                const article_id = Object.keys(article)[0];
                const articleRef = article[article_id].article_ref
                const articleSnap = await getDoc(articleRef);

                return {
                    name: articleSnap.data()?.name,
                    id: article_id,
                    quantity: Object.values(article)[0].quantity
                }
            } catch (e) {
                console.error(e);
                return e;
            }
        },

        async get_warehouse(warehouse_id) {

            const docRef = doc(db, "warehouses", warehouse_id);

            try {
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists())
                    throw "Document does not exist!";

                const origin_warehouse = docSnap.data();

                return origin_warehouse;
            } catch (e) {
                console.error(e);
                return e;
            }
        },

        async get_warehouse_inventory(warehouse) {

            const docRef = doc(db, "warehouses", warehouse.id);

            try {
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists())
                    throw "Document does not exist!";

                const origin_warehouse = docSnap.data();
                console.log(origin_warehouse)

                // get articles details
                const detailed_origin_warehouse = await Promise.all(origin_warehouse.inventory.map((article) =>
                    this.get_article(article)
                ));

                return detailed_origin_warehouse;
            } catch (e) {
                console.error(e);
                return e;
            }
        },

        async update_warehouse_inventory(warehouse) {
            console.log('update_warehouse_inventory', warehouse)
            const docRef = doc(db, "warehouses", warehouse.id);

            try {
                await runTransaction(db, async (transaction) => {
                    const docTransaction = await transaction.get(docRef);

                    if (!docTransaction.exists())
                        throw "Document does not exist!";

                    let new_inventory = docTransaction.data()['inventory'];

                    this.inventory.forEach((article) => {
                        if (verifyExistsInInventory(new_inventory, article.id)) {
                            const position = getArticlePositionInInventory(new_inventory, article.id);
                            const newQty = new_inventory[position][article.id].quantity + article.quantity;
                            if (position !== null) new_inventory[position][article.id].quantity = newQty;
                            else throw "Error updating inventory";
                        } else {
                            const ArticleDocRef = doc(db, "inventory", article.id);
                            new_inventory.push({ [article.id]: { article_ref: ArticleDocRef, quantity: article.quantity } })
                        }
                    });
                    transaction.update(docRef, `inventory`, new_inventory);
                    this.inventory = [];
                });

            } catch (e) {
                console.error(e);
                return e;
            }

        },

        async transfer_warehouse_inventory(warehouse_origin, warehouse_destination) {
            const warehouse_origin_ref = doc(db, "warehouses", warehouse_origin.id);
            const warehouse_destination_ref = doc(db, "warehouses", warehouse_destination.id);
            console.log('transfer_warehouse_inventory', warehouse_origin, warehouse_destination)

            try {
                await runTransaction(db, async (transaction) => {
                    const warehouse_origin_transaction = await transaction.get(warehouse_origin_ref);

                    if (!warehouse_origin_transaction.exists())
                        throw "Document does not exist!";

                    let origin_inventory = warehouse_origin_transaction.data()['inventory'];

                    this.inventory.forEach((article) => {
                        // update origin inventory
                        if (verifyExistsInInventory(origin_inventory, article.id)) {
                            const position = getArticlePositionInInventory(origin_inventory, article.id);
                            const newQty = origin_inventory[position][article.id].quantity - article.quantity;
                            if (position !== null) origin_inventory[position][article.id].quantity = newQty;
                            else throw "Error updating origin inventory";
                        } else {
                            const ArticleDocRef = doc(db, "inventory", article.id);
                            origin_inventory.push({ [article.id]: { article_ref: ArticleDocRef, quantity: article.quantity } })
                        }

                    });

                    transaction.update(warehouse_origin_ref, `inventory`, origin_inventory);

                });

                await runTransaction(db, async (transaction) => {
                    const warehouse_destination_transaction = await transaction.get(warehouse_destination_ref);

                    if (!warehouse_destination_transaction.exists())
                        throw "Document does not exist!";

                    let destination_inventory = warehouse_destination_transaction.data()['inventory'];

                    this.inventory.forEach((article) => {
                        // update destination inventory
                        if (verifyExistsInInventory(destination_inventory, article.id)) {
                            const position = getArticlePositionInInventory(destination_inventory, article.id);
                            const newQty = destination_inventory[position][article.id].quantity + article.quantity;
                            if (position !== null) destination_inventory[position][article.id].quantity = newQty;
                            else throw "Error updating destination inventory";
                        } else {
                            const ArticleDocRef = doc(db, "inventory", article.id);
                            destination_inventory.push({ [article.id]: { article_ref: ArticleDocRef, quantity: article.quantity } })
                        }
                    });

                    transaction.update(warehouse_destination_ref, `inventory`, destination_inventory);

                });

                this.inventory = [];
            } catch (e) {
                console.error(e);
                return e;
            }

        },
    }
})