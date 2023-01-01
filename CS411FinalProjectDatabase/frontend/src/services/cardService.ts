
import http from "../http-common";
import { CardData } from "../types";

class CardService {
  getAllCards() {
    //  should return an array 
    return http.get("/cards");
  }

  getCardById(id: number) {
    return http.get(`/cards/${id}`);
  }

  getCardByKeyword(keyword: string) {
    // keyword is name of card or bank
    return http.get(`/cards?keyword=${keyword}`);
  }

  getSortedCards(sortBy: string) {}

  deleteCard(id: number) {
    return http.delete(`/cards/${id}`);
  }

  createCard(card: CardData) {
    return http.post("/cards", card);
  }


//   updateCard(id: number) {
//  need to update the parameters to match what we want to update
// }
}

export default new CardService();