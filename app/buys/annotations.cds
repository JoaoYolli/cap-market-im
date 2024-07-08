using Process as service from '../../srv/Process';
using from '../../db/schema';
annotate service.Buys with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : date,
            },
            {
                $Type : 'UI.DataField',
                Label : 'totalPrice',
                Value : totalPrice,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Products',
            ID : 'Products',
            Target : 'products/@UI.LineItem#Products',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : ID,
            Label : 'ID',
        },
        {
            $Type : 'UI.DataField',
            Value : date,
        },
        {
            $Type : 'UI.DataField',
            Label : 'totalPrice',
            Value : totalPrice,
        },
    ],
);

annotate service.Buys.products with @(
    UI.LineItem #Products : [
        {
            $Type : 'UI.DataField',
            Value : ID,
            Label : 'ID',
            ![@UI.Importance] : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : quant,
            Label : 'quant',
        },]
);
annotate service.Buys.products with {
    ID @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Products',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : ID,
                    ValueListProperty : 'buyid',
                },
            ],
            Label : 'Producto',
        },
        Common.ValueListWithFixedValues : true
)};
annotate service.Products with {
    name @Common.Text : descr
};
annotate service.Buys.products with {
    ID @Common.FieldControl : #Mandatory
};
annotate service.Products with {
    buyid @Common.Text : name
};
annotate service.Buys with @(
    UI.SelectionPresentationVariant #tableView : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : {
            $Type : 'UI.PresentationVariantType',
            Visualizations : [
                '@UI.LineItem',
            ],
        },
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
            ],
        },
        Text : 'Table View',
    },
    UI.LineItem #tableView : [
    ],
    UI.SelectionPresentationVariant #tableView1 : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : {
            $Type : 'UI.PresentationVariantType',
            Visualizations : [
                '@UI.LineItem#tableView',
            ],
        },
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
            ],
        },
        Text : 'Table View 1',
    }
);
annotate service.Buys with @(
    UI.FieldGroup #General : {
        $Type : 'UI.FieldGroupType',
        Data : [],
    }
);
annotate service.Buys with {
    totalPrice @Common.FieldControl : #ReadOnly
};
