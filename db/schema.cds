using { managed } from '@sap/cds/common';
namespace com.shop;

entity product {
    key ID    : UUID;
        name  : String(50);
        descr : String(50);
        price : Decimal;
        UM    : String(10);
        stock : Decimal;
        buyid : String;
}

entity buys {
    key ID         : UUID;
        date       : String(10);
        products   : Composition of many {
        key UUID : UUID;
            ID : String default ' ';
            quant : Decimal;
        };
        totalPrice : Decimal;
}
