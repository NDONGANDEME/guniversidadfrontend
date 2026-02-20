export class u_aula
{
    static manejoTabla(){
        $(document).ready( () => {
            $('#tablaAulas').DataTable({
                language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
                responsive: {
                    details: {
                        display: $.fn.dataTable.Responsive.display.modal({
                            header: function(row) {
                                var data = row.data();
                                return 'Detalles de: ' + data[0];
                            }
                        }),
                        renderer: $.fn.dataTable.Responsive.renderer.tableAll()
                    }
                }
            });
        });
    }
}