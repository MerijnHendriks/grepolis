using System;
using System.Windows;
using Game.Client.Views;

namespace Game.Client
{
    public class Program : Application
    {
        [STAThread()]
        public static void Main(string[] args)
        {
            Program app = new Program();
            app.Startup += new StartupEventHandler(app.Application_Startup);
            app.Run();
        }

        public void Application_Startup(object sender, StartupEventArgs e)
        {
            new MainWindow().Show();
        }
    }
}
