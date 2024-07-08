using { com.shop as shop } from '../db/schema';

service Process {

    entity Products as projection on shop.product;
    entity Buys as projection on shop.buys;

}

annotate Process.Products with @odata.draft.enabled;
annotate Process.Buys with @odata.draft.enabled;


